const db = require('../config/db');

const ALLOWED_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
];

const ALLOWED_SMOOTHIE_CATEGORIES = [
  'Berry',
  'Tropical',
  'Green',
  'Energy',
  'Protein',
];

const toBit = (value, defaultValue = 0) => {
  if (value === undefined || value === null) return defaultValue;
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return 1;
  }
  return 0;
};

const parsePrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
};

const getDashboard = async (req, res) => {
  try {
    const [[orderStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalOrders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmedOrders,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) AS preparingOrders,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS readyOrders,
        SUM(CASE WHEN status = 'out_for_delivery' THEN 1 ELSE 0 END) AS outForDeliveryOrders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedOrders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS totalRevenue
      FROM orders
    `);

    const [[userStats]] = await db.query(`
      SELECT COUNT(*) AS totalUsers
      FROM users
    `);

    const [[smoothieStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalSmoothies,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeSmoothies,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS availableSmoothies,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) AS featuredSmoothies
      FROM smoothies
    `);

    const [recentOrders] = await db.query(`
      SELECT
        o.id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      data: {
        orders: orderStats,
        users: userStats,
        smoothies: smoothieStats,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard.',
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

    let sql = `
      SELECT
        o.id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.fulfillment_type,
        o.payment_method,
        o.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE 1 = 1
    `;

    const params = [];

    if (status) {
      sql += ` AND o.status = ? `;
      params.push(status);
    }

    if (search) {
      sql += `
        AND (
          u.full_name LIKE ?
          OR u.email LIKE ?
          OR o.order_number LIKE ?
          OR CAST(o.id AS CHAR) LIKE ?
        )
      `;
      params.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    sql += ` ORDER BY o.created_at DESC `;

    const [orders] = await db.query(sql, params);

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load orders.',
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id.',
      });
    }

    if (!status || !ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
      });
    }

    const [result] = await db.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [status, orderId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully.',
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT
        id,
        full_name,
        full_name AS name,
        email,
        phone,
        is_active,
        is_admin,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load users.',
    });
  }
};

const getAllSmoothies = async (req, res) => {
  try {
    const [smoothies] = await db.query(`
      SELECT
        s.id,
        s.name,
        s.description,
        s.category,
        s.image_url,
        s.is_featured,
        s.is_active,
        s.created_at,
        COALESCE(MAX(CASE WHEN ss.size_name = 'small' THEN ss.price END), 0) AS small_price,
        COALESCE(MAX(CASE WHEN ss.size_name = 'large' THEN ss.price END), 0) AS large_price,
        COALESCE(MIN(ss.price), 0) AS price,
        s.is_active AS is_available
      FROM smoothies s
      LEFT JOIN smoothie_sizes ss ON ss.smoothie_id = s.id
      GROUP BY
        s.id,
        s.name,
        s.description,
        s.category,
        s.image_url,
        s.is_featured,
        s.is_active,
        s.created_at
      ORDER BY s.created_at DESC
    `);

    return res.json({
      success: true,
      count: smoothies.length,
      data: smoothies,
    });
  } catch (error) {
    console.error('getAllSmoothies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load smoothies.',
    });
  }
};

const createSmoothie = async (req, res) => {
  let connection;

  try {
    const {
      name,
      description,
      image_url,
      category,
      is_featured,
      is_active,
      small_price,
      large_price,
      price,
    } = req.body;

    const resolvedSmallPrice = parsePrice(
      small_price !== undefined ? small_price : price
    );
    const resolvedLargePrice = parsePrice(
      large_price !== undefined ? large_price : price
    );

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!category || !ALLOWED_SMOOTHIE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${ALLOWED_SMOOTHIE_CATEGORIES.join(', ')}`,
      });
    }

    if (resolvedSmallPrice === null || resolvedLargePrice === null) {
      return res.status(400).json({
        success: false,
        message: 'Valid small_price and large_price are required.',
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO smoothies
      (
        name,
        description,
        category,
        image_url,
        is_featured,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        String(name).trim(),
        description || '',
        category,
        image_url || null,
        toBit(is_featured, 0),
        toBit(is_active, 1),
      ]
    );

    const smoothieId = result.insertId;

    await connection.query(
      `
      INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
      VALUES
        (?, 'small', ?),
        (?, 'large', ?)
      `,
      [smoothieId, resolvedSmallPrice, smoothieId, resolvedLargePrice]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Smoothie created successfully.',
      id: smoothieId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('createSmoothie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create smoothie.',
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateSmoothie = async (req, res) => {
  let connection;

  try {
    const smoothieId = Number(req.params.id);
    const {
      name,
      description,
      image_url,
      category,
      is_featured,
      is_active,
      small_price,
      large_price,
      price,
    } = req.body;

    if (!smoothieId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid smoothie id.',
      });
    }

    const resolvedSmallPrice = parsePrice(
      small_price !== undefined ? small_price : price
    );
    const resolvedLargePrice = parsePrice(
      large_price !== undefined ? large_price : price
    );

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!category || !ALLOWED_SMOOTHIE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${ALLOWED_SMOOTHIE_CATEGORIES.join(', ')}`,
      });
    }

    if (resolvedSmallPrice === null || resolvedLargePrice === null) {
      return res.status(400).json({
        success: false,
        message: 'Valid small_price and large_price are required.',
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      UPDATE smoothies
      SET
        name = ?,
        description = ?,
        category = ?,
        image_url = ?,
        is_featured = ?,
        is_active = ?
      WHERE id = ?
      `,
      [
        String(name).trim(),
        description || '',
        category,
        image_url || null,
        toBit(is_featured, 0),
        toBit(is_active, 1),
        smoothieId,
      ]
    );

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Smoothie not found.',
      });
    }

    await connection.query(
      `
      INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
      VALUES
        (?, 'small', ?),
        (?, 'large', ?)
      ON DUPLICATE KEY UPDATE price = VALUES(price)
      `,
      [smoothieId, resolvedSmallPrice, smoothieId, resolvedLargePrice]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'Smoothie updated successfully.',
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('updateSmoothie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update smoothie.',
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const deleteSmoothie = async (req, res) => {
  try {
    const smoothieId = Number(req.params.id);

    if (!smoothieId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid smoothie id.',
      });
    }

    const [result] = await db.query(
      `
      UPDATE smoothies
      SET
        is_active = 0,
        is_featured = 0
      WHERE id = ?
      `,
      [smoothieId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Smoothie not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Smoothie deactivated successfully.',
    });
  } catch (error) {
    console.error('deleteSmoothie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate smoothie.',
    });
  }
};

module.exports = {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllSmoothies,
  createSmoothie,
  updateSmoothie,
  deleteSmoothie,
};