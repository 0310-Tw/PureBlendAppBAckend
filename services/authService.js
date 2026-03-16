const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, preferred_fulfillment, profile_image_url, is_active, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ full_name, email, phone, password }) => {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?)`,
    [full_name, email, phone || null, password_hash]
  );

  return findUserById(result.insertId);
};

const matchPassword = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  matchPassword
};