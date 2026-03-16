const pool = require('../config/db');

const getSmoothieById = async (smoothieId) => {
  const [rows] = await pool.query(
    `
    SELECT id, name, description, category, image_url, is_active
    FROM smoothies
    WHERE id = ? AND is_active = 1
    LIMIT 1
    `,
    [smoothieId]
  );

  return rows[0] || null;
};

const getSmoothieSizePrice = async (smoothieId, sizeName) => {
  const [rows] = await pool.query(
    `
    SELECT id, smoothie_id, size_name, price
    FROM smoothie_sizes
    WHERE smoothie_id = ? AND size_name = ?
    LIMIT 1
    `,
    [smoothieId, sizeName]
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
      c.created_at,
      c.updated_at,
      s.name,
      s.description,
      s.category,
      s.image_url,
      (c.quantity * c.unit_price) AS line_total
    FROM cart_items c
    INNER JOIN smoothies s ON c.smoothie_id = s.id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
    `,
    [userId]
  );

  const subtotal = rows.reduce(
    (sum, item) => sum + Number(item.line_total),
    0
  );

  return {
    items: rows,
    summary: {
      item_count: rows.length,
      subtotal: subtotal.toFixed(2)
    }
  };
};

const getCartItemByIdAndUserId = async (cartItemId, userId) => {
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
      c.created_at,
      c.updated_at,
      s.name,
      s.description,
      s.category,
      s.image_url,
      (c.quantity * c.unit_price) AS line_total
    FROM cart_items c
    INNER JOIN smoothies s ON c.smoothie_id = s.id
    WHERE c.id = ? AND c.user_id = ?
    LIMIT 1
    `,
    [cartItemId, userId]
  );

  return rows[0] || null;
};

const addCartItem = async (userId, cartData) => {
  const {
    smoothie_id,
    size_name,
    quantity,
    notes
  } = cartData;

  const sizeRow = await getSmoothieSizePrice(smoothie_id, size_name);

  const [result] = await pool.query(
    `
    INSERT INTO cart_items (
      user_id,
      smoothie_id,
      size_name,
      quantity,
      unit_price,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      smoothie_id,
      size_name,
      quantity,
      sizeRow.price,
      notes || null
    ]
  );

  return getCartItemByIdAndUserId(result.insertId, userId);
};

const updateCartItem = async (cartItemId, userId, cartData) => {
  const {
    size_name,
    quantity,
    notes
  } = cartData;

  const existingItem = await getCartItemByIdAndUserId(cartItemId, userId);
  if (!existingItem) {
    return null;
  }

  const sizeRow = await getSmoothieSizePrice(existingItem.smoothie_id, size_name);

  await pool.query(
    `
    UPDATE cart_items
    SET
      size_name = ?,
      quantity = ?,
      unit_price = ?,
      notes = ?
    WHERE id = ? AND user_id = ?
    `,
    [
      size_name,
      quantity,
      sizeRow.price,
      notes || null,
      cartItemId,
      userId
    ]
  );

  return getCartItemByIdAndUserId(cartItemId, userId);
};

const deleteCartItem = async (cartItemId, userId) => {
  const [result] = await pool.query(
    `
    DELETE FROM cart_items
    WHERE id = ? AND user_id = ?
    `,
    [cartItemId, userId]
  );

  return result.affectedRows > 0;
};

const clearCartByUserId = async (userId) => {
  const [result] = await pool.query(
    `
    DELETE FROM cart_items
    WHERE user_id = ?
    `,
    [userId]
  );

  return result.affectedRows;
};

module.exports = {
  getSmoothieById,
  getSmoothieSizePrice,
  getCartItemsByUserId,
  getCartItemByIdAndUserId,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCartByUserId
};