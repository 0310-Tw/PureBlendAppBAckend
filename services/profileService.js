const pool = require('../config/db');

const getProfileByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      full_name,
      email,
      phone,
      preferred_fulfillment,
      profile_image_url,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `
    SELECT id, email
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const updateProfileByUserId = async (userId, profileData) => {
  const {
    full_name,
    email,
    phone,
    profile_image_url
  } = profileData;

  await pool.query(
    `
    UPDATE users
    SET
      full_name = ?,
      email = ?,
      phone = ?,
      profile_image_url = ?
    WHERE id = ?
    `,
    [
      full_name,
      email,
      phone || null,
      profile_image_url || null,
      userId
    ]
  );

  return getProfileByUserId(userId);
};

const updatePreferencesByUserId = async (userId, preferenceData) => {
  const { preferred_fulfillment } = preferenceData;

  await pool.query(
    `
    UPDATE users
    SET preferred_fulfillment = ?
    WHERE id = ?
    `,
    [preferred_fulfillment, userId]
  );

  return getProfileByUserId(userId);
};

module.exports = {
  getProfileByUserId,
  getUserByEmail,
  updateProfileByUserId,
  updatePreferencesByUserId
};