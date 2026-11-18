const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/goals
exports.listGoals = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.*,
        CASE
          WHEN g.target_value > 0 THEN ROUND((g.current_value / g.target_value) * 100, 2)
          ELSE 0
        END AS progress_pct
       FROM goals g
       WHERE g.user_id = ? AND g.deleted_at IS NULL
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/goals
exports.createGoal = async (req, res, next) => {
  try {
    const { title, description, type, target_value, unit, start_date, end_date, color, category_id } = req.body;
    if (!title) return error(res, 'Title is required', 400);

    const [result] = await pool.query(
      `INSERT INTO goals (user_id, category_id, title, description, type, target_value, unit, start_date, end_date, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [req.user.id, category_id || null, title, description || null,
       type || 'quantifiable', target_value || null, unit || null,
       start_date || new Date().toISOString().slice(0, 10), end_date || null,
       color || '#6366f1']
    );

    const [goals] = await pool.query('SELECT * FROM goals WHERE id = ?', [result.insertId]);
    return success(res, goals[0], 'Goal created', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/goals/:id
exports.getGoal = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Goal not found', 404);

    const [progress] = await pool.query(
      'SELECT * FROM goal_progress WHERE goal_id = ? ORDER BY recorded_at DESC LIMIT 50',
      [req.params.id]
    );

    return success(res, { ...rows[0], progress });
  } catch (err) {
    next(err);
  }
};

// PUT /api/goals/:id
exports.updateGoal = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM goals WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Goal not found', 404);

    const allowed = ['title', 'description', 'type', 'target_value', 'unit', 'status', 'start_date', 'end_date', 'color', 'category_id'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await pool.query(
        `UPDATE goals SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
        [...Object.values(updates), req.params.id]
      );
    }

    const [updated] = await pool.query('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    return success(res, updated[0], 'Goal updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM goals WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Goal not found', 404);
    await pool.query('UPDATE goals SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    return success(res, null, 'Goal deleted');
  } catch (err) {
    next(err);
  }
};

// POST /api/goals/:id/progress
exports.addProgress = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Goal not found', 404);

    const { value, notes } = req.body;
    if (value === undefined) return error(res, 'Value is required', 400);

    // Insert progress entry
    const [result] = await pool.query(
      'INSERT INTO goal_progress (goal_id, user_id, value, notes, created_at) VALUES (?, ?, ?, ?, NOW())',
      [req.params.id, req.user.id, value, notes || null]
    );

    // Recalculate current_value as sum of all progress entries
    const [sumResult] = await pool.query(
      'SELECT SUM(value) AS total FROM goal_progress WHERE goal_id = ?',
      [req.params.id]
    );
    const newCurrent = sumResult[0].total || 0;

    await pool.query(
      'UPDATE goals SET current_value = ?, updated_at = NOW() WHERE id = ?',
      [newCurrent, req.params.id]
    );

    // Auto-complete if target reached
    const goal = rows[0];
    if (goal.target_value && newCurrent >= goal.target_value) {
      await pool.query(
        "UPDATE goals SET status = 'completed', updated_at = NOW() WHERE id = ?",
        [req.params.id]
      );
    }

    const [progress] = await pool.query('SELECT * FROM goal_progress WHERE id = ?', [result.insertId]);
    return success(res, { progress: progress[0], current_value: newCurrent }, 'Progress added', 201);
  } catch (err) {
    next(err);
  }
};
