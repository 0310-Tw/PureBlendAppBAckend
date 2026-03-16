const pool = require('../config/db');

const getFavoritesByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      f.id AS favorite_id,
      f.user_id,
      f.smoothie_id,
      f.created_at AS favorited_at,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active,
      MIN(ss.price) AS starting_price,
      MAX(CASE WHEN ss.size_name = 'small' THEN ss.price END) AS small_price,
      MAX(CASE WHEN ss.size_name = 'large' THEN ss.price END) AS large_price
    FROM favorites f
    INNER JOIN smoothies s ON f.smoothie_id = s.id
    LEFT JOIN smoothie_sizes ss ON s.id = ss.smoothie_id
    WHERE f.user_id = ?
      AND s.is_active = 1
    GROUP BY
      f.id,
      f.user_id,
      f.smoothie_id,
      f.created_at,
      s.id,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active
    ORDER BY f.created_at DESC
    `,
    [userId]
  );

  return rows;
};

const smoothieExists = async (smoothieId) => {
  const [rows] = await pool.query(
    `
    SELECT id, name, is_active
    FROM smoothies
    WHERE id = ? AND is_active = 1
    LIMIT 1
    `,
    [smoothieId]
  );

  return rows[0] || null;
};

const favoriteExists = async (userId, smoothieId) => {
  const [rows] = await pool.query(
    `
    SELECT id, user_id, smoothie_id, created_at
    FROM favorites
    WHERE user_id = ? AND smoothie_id = ?
    LIMIT 1
    `,
    [userId, smoothieId]
  );

  return rows[0] || null;
};

const addFavorite = async (userId, smoothieId) => {
  const [result] = await pool.query(
    `
    INSERT INTO favorites (user_id, smoothie_id)
    VALUES (?, ?)
    `,
    [userId, smoothieId]
  );

  const [rows] = await pool.query(
    `
    SELECT
      f.id AS favorite_id,
      f.user_id,
      f.smoothie_id,
      f.created_at AS favorited_at,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active,
      MIN(ss.price) AS starting_price,
      MAX(CASE WHEN ss.size_name = 'small' THEN ss.price END) AS small_price,
      MAX(CASE WHEN ss.size_name = 'large' THEN ss.price END) AS large_price
    FROM favorites f
    INNER JOIN smoothies s ON f.smoothie_id = s.id
    LEFT JOIN smoothie_sizes ss ON s.id = ss.smoothie_id
    WHERE f.id = ?
    GROUP BY
      f.id,
      f.user_id,
      f.smoothie_id,
      f.created_at,
      s.id,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active
    LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
};

const removeFavorite = async (userId, smoothieId) => {
  const [result] = await pool.query(
    `
    DELETE FROM favorites
    WHERE user_id = ? AND smoothie_id = ?
    `,
    [userId, smoothieId]
  );

  return result.affectedRows > 0;
};

module.exports = {
  getFavoritesByUserId,
  smoothieExists,
  favoriteExists,
  addFavorite,
  removeFavorite
};