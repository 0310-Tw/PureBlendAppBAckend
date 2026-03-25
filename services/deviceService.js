const pool = require('../config/db');

const upsertUserDeviceToken = async ({ userId, fcmToken, platform }) => {
  await pool.query(
    `
    INSERT INTO user_devices (user_id, fcm_token, platform)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      platform = VALUES(platform),
      updated_at = CURRENT_TIMESTAMP
    `,
    [userId, fcmToken, platform || null]
  );

  const [rows] = await pool.query(
    `
    SELECT id, user_id, fcm_token, platform, created_at, updated_at
    FROM user_devices
    WHERE fcm_token = ?
    LIMIT 1
    `,
    [fcmToken]
  );

  return rows[0] || null;
};

const deleteUserDeviceToken = async ({ userId, fcmToken }) => {
  const [result] = await pool.query(
    `
    DELETE FROM user_devices
    WHERE user_id = ? AND fcm_token = ?
    `,
    [userId, fcmToken]
  );

  return result.affectedRows > 0;
};

const getUserDeviceTokens = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT fcm_token
    FROM user_devices
    WHERE user_id = ?
    ORDER BY updated_at DESC
    `,
    [userId]
  );

  return rows.map((row) => row.fcm_token);
};

module.exports = {
  upsertUserDeviceToken,
  deleteUserDeviceToken,
  getUserDeviceTokens,
};