const pool = require('../config/db');

const getAllSmoothies = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active,
      s.created_at,
      s.updated_at,
      MIN(ss.price) AS starting_price,
      MAX(CASE WHEN ss.size_name = 'small' THEN ss.price END) AS small_price,
      MAX(CASE WHEN ss.size_name = 'large' THEN ss.price END) AS large_price
    FROM smoothies s
    LEFT JOIN smoothie_sizes ss ON s.id = ss.smoothie_id
    WHERE s.is_active = 1
    GROUP BY
      s.id,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active,
      s.created_at,
      s.updated_at
    ORDER BY s.name ASC
    `
  );

  return rows;
};

const getFeaturedSmoothies = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active,
      s.created_at,
      s.updated_at,
      MIN(ss.price) AS starting_price,
      MAX(CASE WHEN ss.size_name = 'small' THEN ss.price END) AS small_price,
      MAX(CASE WHEN ss.size_name = 'large' THEN ss.price END) AS large_price
    FROM smoothies s
    LEFT JOIN smoothie_sizes ss ON s.id = ss.smoothie_id
    WHERE s.is_active = 1
      AND s.is_featured = 1
    GROUP BY
      s.id,
      s.name,
      s.description,
      s.category,
      s.image_url,
      s.is_featured,
      s.is_active,
      s.created_at,
      s.updated_at
    ORDER BY s.name ASC
    `
  );

  return rows;
};

const getSmoothieById = async (id) => {
  const [smoothieRows] = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      category,
      image_url,
      is_featured,
      is_active,
      created_at,
      updated_at
    FROM smoothies
    WHERE id = ? AND is_active = 1
    LIMIT 1
    `,
    [id]
  );

  if (!smoothieRows.length) {
    return null;
  }

  const smoothie = smoothieRows[0];

  const [sizeRows] = await pool.query(
    `
    SELECT
      id,
      smoothie_id,
      size_name,
      price,
      created_at
    FROM smoothie_sizes
    WHERE smoothie_id = ?
    ORDER BY FIELD(size_name, 'small', 'large')
    `,
    [id]
  );

  smoothie.sizes = sizeRows;

  return smoothie;
};

module.exports = {
  getAllSmoothies,
  getFeaturedSmoothies,
  getSmoothieById
};