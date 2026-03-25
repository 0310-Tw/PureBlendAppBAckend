const pool = require('../config/db');
const sendPushNotification = require('../helpers/sendPushNotification');
const { getUserDeviceTokens } = require('./deviceService');

const getAddressByIdAndUserId = async (addressId, userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      label,
      recipient_name,
      recipient_phone,
      street_address,
      town,
      parish,
      delivery_notes,
      is_default,
      created_at,
      updated_at
    FROM addresses
    WHERE id = ? AND user_id = ?
    LIMIT 1
    `,
    [addressId, userId]
  );

  return rows[0] || null;
};

const getCartItemsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.user_id,
      c.smoothie_id,
      c.size_name,
      c.quantity,
      c.unit_price,
      c.notes,
      s.name
    FROM cart_items c
    INNER JOIN smoothies s ON c.smoothie_id = s.id
    WHERE c.user_id = ?
    ORDER BY c.id ASC
    `,
    [userId]
  );

  return rows;
};

const calculateCartSubtotal = (cartItems) => {
  return cartItems.reduce((sum, item) => {
    return sum + (Number(item.unit_price) * Number(item.quantity));
  }, 0);
};

const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);

  return `PB-${year}${month}${day}-${random}`;
};

const createOrderFromCart = async (userId, orderData) => {
  const {
    fulfillment_type,
    payment_method,
    address_id,
    order_notes,
  } = orderData;

  const cartItems = await getCartItemsByUserId(userId);

  if (!cartItems.length) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  let address = null;

  if (fulfillment_type === 'delivery') {
    if (!address_id) {
      const error = new Error('address_id is required for delivery orders');
      error.statusCode = 400;
      throw error;
    }

    address = await getAddressByIdAndUserId(address_id, userId);

    if (!address) {
      const error = new Error('Delivery address not found');
      error.statusCode = 404;
      throw error;
    }
  }

  const subtotal = calculateCartSubtotal(cartItems);
  const delivery_fee = fulfillment_type === 'delivery' ? 300.0 : 0.0;
  const total_amount = subtotal + delivery_fee;
  const order_number = generateOrderNumber();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (
        order_number,
        user_id,
        address_id,
        fulfillment_type,
        payment_method,
        order_notes,
        subtotal,
        delivery_fee,
        total_amount,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        order_number,
        userId,
        fulfillment_type === 'delivery' ? address_id : null,
        fulfillment_type,
        payment_method,
        order_notes || null,
        subtotal,
        delivery_fee,
        total_amount,
        'pending',
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      const line_total = Number(item.unit_price) * Number(item.quantity);

      await connection.query(
        `
        INSERT INTO order_items (
          order_id,
          smoothie_id,
          smoothie_name,
          size_name,
          quantity,
          unit_price,
          line_total,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.smoothie_id,
          item.name,
          item.size_name,
          item.quantity,
          item.unit_price,
          line_total,
          item.notes || null,
        ]
      );
    }

    await connection.query(
      `
      DELETE FROM cart_items
      WHERE user_id = ?
      `,
      [userId]
    );

    await connection.commit();

    const order = await getOrderByIdAndUserId(orderId, userId);
    return order;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getOrdersByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      o.id,
      o.order_number,
      o.user_id,
      o.address_id,
      o.fulfillment_type,
      o.payment_method,
      o.order_notes,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.status,
      o.created_at,
      o.updated_at,
      COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY
      o.id,
      o.order_number,
      o.user_id,
      o.address_id,
      o.fulfillment_type,
      o.payment_method,
      o.order_notes,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.status,
      o.created_at,
      o.updated_at
    ORDER BY o.created_at DESC, o.id DESC
    `,
    [userId]
  );

  return rows;
};

const getOrderByIdAndUserId = async (orderId, userId) => {
  const [orderRows] = await pool.query(
    `
    SELECT
      o.id,
      o.order_number,
      o.user_id,
      o.address_id,
      o.fulfillment_type,
      o.payment_method,
      o.order_notes,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.status,
      o.created_at,
      o.updated_at,
      a.label AS address_label,
      a.recipient_name,
      a.recipient_phone,
      a.street_address,
      a.town,
      a.parish,
      a.delivery_notes AS address_delivery_notes
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    WHERE o.id = ? AND o.user_id = ?
    LIMIT 1
    `,
    [orderId, userId]
  );

  if (!orderRows.length) {
    return null;
  }

  const order = orderRows[0];

  const [itemRows] = await pool.query(
    `
    SELECT
      id,
      order_id,
      smoothie_id,
      smoothie_name,
      size_name,
      quantity,
      unit_price,
      line_total,
      notes,
      created_at
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
    `,
    [orderId]
  );

  order.items = itemRows;

  return order;
};

const getOrderById = async (orderId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      order_number,
      user_id,
      fulfillment_type,
      status
    FROM orders
    WHERE id = ?
    LIMIT 1
    `,
    [orderId]
  );

  return rows[0] || null;
};

const updateOrderStatus = async (orderId, status) => {
  await pool.query(
    `
    UPDATE orders
    SET status = ?
    WHERE id = ?
    `,
    [status, orderId]
  );

  const order = await getOrderById(orderId);

  if (!order) {
    return null;
  }

  if (status === 'ready') {
    const tokens = await getUserDeviceTokens(order.user_id);

    for (const token of tokens) {
      try {
        await sendPushNotification({
          token,
          title: 'Pure Blend Smoothie App',
          body: order.fulfillment_type === 'pickup'
            ? 'Your order is ready for pickup.'
            : 'Your order is ready.',
          data: {
            order_id: order.id,
            order_number: order.order_number,
            status: order.status,
            fulfillment_type: order.fulfillment_type,
          },
        });
      } catch (error) {
        console.error(`Failed to send notification to token ${token}:`, error.message);
      }
    }
  }

  return order;
};

module.exports = {
  getAddressByIdAndUserId,
  getCartItemsByUserId,
  createOrderFromCart,
  getOrdersByUserId,
  getOrderByIdAndUserId,
  getOrderById,
  updateOrderStatus,
};