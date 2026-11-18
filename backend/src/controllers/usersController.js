const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/users/settings
exports.getSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );
    if (!rows.length) return error(res, 'Settings not found', 404);
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const allowed = [
      'theme', 'language', 'date_format', 'week_start',
      'notifications_enabled', 'pomodoro_work_minutes',
      'pomodoro_short_break', 'pomodoro_long_break', 'pomodoro_cycles'
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (!Object.keys(updates).length) {
      return error(res, 'No valid fields to update', 400);
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.user.id];

    await pool.query(
      `UPDATE user_settings SET ${setClauses}, updated_at = NOW() WHERE user_id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );
    return success(res, rows[0], 'Settings updated');
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'avatar_url'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (!Object.keys(updates).length) {
      return error(res, 'No valid fields to update', 400);
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.user.id];

    await pool.query(
      `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, avatar_url, bio, level, experience_points, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );
    return success(res, rows[0], 'Profile updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/account
exports.deleteAccount = async (req, res, next) => {
  try {
    const now = new Date();
    // Soft-delete user and all owned data
    await pool.query('UPDATE users SET deleted_at = ? WHERE id = ?', [now, req.user.id]);
    await pool.query('UPDATE habits SET deleted_at = ? WHERE user_id = ?', [now, req.user.id]);
    await pool.query('UPDATE tasks SET deleted_at = ? WHERE user_id = ?', [now, req.user.id]);
    await pool.query('UPDATE goals SET deleted_at = ? WHERE user_id = ?', [now, req.user.id]);
    await pool.query('UPDATE subjects SET deleted_at = ? WHERE user_id = ?', [now, req.user.id]);
    await pool.query('UPDATE study_notes SET deleted_at = ? WHERE user_id = ?', [now, req.user.id]);
    return success(res, null, 'Account deleted successfully');
  } catch (err) {
    next(err);
  }
};
