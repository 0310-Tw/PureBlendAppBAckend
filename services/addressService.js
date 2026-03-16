const pool = require('../config/db');

const getAddressesByUserId = async (userId) => {
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
    WHERE user_id = ?
    ORDER BY is_default DESC, id DESC
    `,
    [userId]
  );

  return rows;
};

const getAddressByIdAndUserId = async (id, userId) => {
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
    [id, userId]
  );

  return rows[0] || null;
};

const createAddress = async (userId, addressData) => {
  const {
    label,
    recipient_name,
    recipient_phone,
    street_address,
    town,
    parish,
    delivery_notes,
    is_default
  } = addressData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (is_default) {
      await connection.query(
        `
        UPDATE addresses
        SET is_default = 0
        WHERE user_id = ?
        `,
        [userId]
      );
    }

    const [result] = await connection.query(
      `
      INSERT INTO addresses (
        user_id,
        label,
        recipient_name,
        recipient_phone,
        street_address,
        town,
        parish,
        delivery_notes,
        is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        label,
        recipient_name || null,
        recipient_phone || null,
        street_address,
        town,
        parish,
        delivery_notes || null,
        is_default ? 1 : 0
      ]
    );

    await connection.commit();

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
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateAddress = async (id, userId, addressData) => {
  const {
    label,
    recipient_name,
    recipient_phone,
    street_address,
    town,
    parish,
    delivery_notes,
    is_default
  } = addressData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (is_default) {
      await connection.query(
        `
        UPDATE addresses
        SET is_default = 0
        WHERE user_id = ?
        `,
        [userId]
      );
    }

    await connection.query(
      `
      UPDATE addresses
      SET
        label = ?,
        recipient_name = ?,
        recipient_phone = ?,
        street_address = ?,
        town = ?,
        parish = ?,
        delivery_notes = ?,
        is_default = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        label,
        recipient_name || null,
        recipient_phone || null,
        street_address,
        town,
        parish,
        delivery_notes || null,
        is_default ? 1 : 0,
        id,
        userId
      ]
    );

    await connection.commit();

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
      [id, userId]
    );

    return rows[0] || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteAddress = async (id, userId) => {
  const [result] = await pool.query(
    `
    DELETE FROM addresses
    WHERE id = ? AND user_id = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
};

const setDefaultAddress = async (id, userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE addresses
      SET is_default = 0
      WHERE user_id = ?
      `,
      [userId]
    );

    const [updateResult] = await connection.query(
      `
      UPDATE addresses
      SET is_default = 1
      WHERE id = ? AND user_id = ?
      `,
      [id, userId]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return null;
    }

    await connection.commit();

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
      [id, userId]
    );

    return rows[0] || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAddressesByUserId,
  getAddressByIdAndUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};