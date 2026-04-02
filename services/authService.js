const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin === 1 || user.is_admin === true,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const mapUser = (row) => ({
  id: row.id,
  name: row.full_name ?? '',
  email: row.email,
  phone: row.phone ?? '',
  preferredFulfillment: row.preferred_fulfillment ?? 'delivery',
  profileImageUrl: row.profile_image_url ?? '',
  isActive: row.is_active === 1 || row.is_active === true,
  isAdmin: row.is_admin === 1 || row.is_admin === true,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const registerUser = async ({ name, email, phone, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `
    INSERT INTO users (
      full_name,
      email,
      phone,
      password_hash,
      preferred_fulfillment,
      profile_image_url,
      is_active,
      is_admin
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      name.trim(),
      normalizedEmail,
      phone?.trim() || '',
      hashedPassword,
      'delivery',
      '',
      1,
      0,
    ]
  );

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
      is_admin,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [result.insertId]
  );

  const user = mapUser(rows[0]);

  return {
    user,
    token: signToken(rows[0]),
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await pool.query(
    `
    SELECT
      id,
      full_name,
      email,
      phone,
      password_hash,
      preferred_fulfillment,
      profile_image_url,
      is_active,
      is_admin,
      created_at,
      updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const userRow = rows[0];

  if (!(userRow.is_active === 1 || userRow.is_active === true)) {
    throw new Error('This account is inactive');
  }

  const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  return {
    user: mapUser(userRow),
    token: signToken(userRow),
  };
};

const getUserProfileById = async (userId) => {
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
      is_admin,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('User not found');
  }

  return mapUser(rows[0]);
};

const createPasswordResetToken = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await pool.query(
    'SELECT id, email, is_active FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (rows.length === 0) {
    return {
      success: true,
      message: 'If that email exists, a reset token has been generated.',
      resetToken: null,
      expiresAt: null,
    };
  }

  const user = rows[0];

  if (!(user.is_active === 1 || user.is_active === true)) {
    return {
      success: true,
      message: 'If that email exists, a reset token has been generated.',
      resetToken: null,
      expiresAt: null,
    };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await pool.query(
    `
    UPDATE users
    SET reset_token = ?, reset_token_expires = ?
    WHERE id = ?
    `,
    [rawToken, expiresAt, user.id]
  );

  return {
    success: true,
    message: 'Reset token generated successfully.',
    resetToken: rawToken,
    expiresAt,
  };
};

const resetPasswordWithToken = async (token, newPassword) => {
  const cleanedToken = token.trim();

  const [rows] = await pool.query(
    `
    SELECT id, reset_token, reset_token_expires
    FROM users
    WHERE reset_token = ?
    LIMIT 1
    `,
    [cleanedToken]
  );

  if (rows.length === 0) {
    throw new Error('Invalid reset token');
  }

  const user = rows[0];

  if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
    throw new Error('Reset token has expired');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
    UPDATE users
    SET
      password_hash = ?,
      reset_token = NULL,
      reset_token_expires = NULL
    WHERE id = ?
    `,
    [hashedPassword, user.id]
  );

  return {
    success: true,
    message: 'Password reset successful.',
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfileById,
  createPasswordResetToken,
  resetPasswordWithToken,
};