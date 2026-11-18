const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { signToken } = require('../config/jwt');
const { success, error } = require('../utils/response');
const { randomToken } = require('../utils/dateHelpers');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check email uniqueness
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    if (existing.length) {
      return error(res, 'Email already registered', 409);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [name.trim(), email.toLowerCase(), password_hash]
    );
    const userId = result.insertId;

    // Create default user_settings
    await pool.query(
      'INSERT INTO user_settings (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
      [userId]
    );

    // Fetch created user
    const [users] = await pool.query(
      'SELECT id, name, email, avatar_url, bio, level, experience_points, created_at FROM users WHERE id = ?',
      [userId]
    );

    const token = signToken({ id: userId, email: users[0].email, name: users[0].name });

    return success(res, { token, user: users[0] }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, avatar_url, bio, level, experience_points, created_at FROM users WHERE email = ? AND deleted_at IS NULL',
      [email.toLowerCase()]
    );

    if (!users.length) {
      return error(res, 'Invalid credentials', 401);
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return error(res, 'Invalid credentials', 401);
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    // Don't return password hash
    delete user.password_hash;

    return success(res, { token, user }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, avatar_url, bio, level, experience_points, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [req.user.id]
    );

    if (!users.length) {
      return error(res, 'User not found', 404);
    }

    return success(res, users[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  return success(res, null, 'Logged out successfully');
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ? AND deleted_at IS NULL',
      [email.toLowerCase()]
    );

    // Always respond success to prevent email enumeration
    if (!users.length) {
      return success(res, null, 'If that email exists, a reset link has been sent.');
    }

    const user = users[0];
    const token = randomToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE',
      [user.id]
    );

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())',
      [user.id, token, expiresAt]
    );

    const data = process.env.NODE_ENV === 'development' ? { reset_token: token } : null;
    return success(res, data, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const [tokens] = await pool.query(
      'SELECT user_id FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (!tokens.length) {
      return error(res, 'Invalid or expired reset token', 400);
    }

    const userId = tokens[0].user_id;
    const password_hash = await bcrypt.hash(password, 12);

    await pool.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, userId]
    );

    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
      [token]
    );

    return success(res, null, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};
