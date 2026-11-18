const { pool } = require('../config/database');
const { success, error } = require('../utils/response');
const { todayUTC, daysAgo } = require('../utils/dateHelpers');

// GET /api/habits
exports.listHabits = async (req, res, next) => {
  try {
    const today = todayUTC();
    const [rows] = await pool.query(
      `SELECT h.*, 
        CASE WHEN hc.id IS NOT NULL THEN TRUE ELSE FALSE END AS completed_today,
        hc.id AS completion_id
       FROM habits h
       LEFT JOIN habit_completions hc ON hc.habit_id = h.id AND hc.completed_date = ? AND hc.user_id = ?
       WHERE h.user_id = ? AND h.deleted_at IS NULL
       ORDER BY h.created_at DESC`,
      [today, req.user.id, req.user.id]
    );
    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/habits
exports.createHabit = async (req, res, next) => {
  try {
    const { name, description, frequency, custom_days, reminder_time, color, icon, category_id } = req.body;

    if (!name) return error(res, 'Name is required', 400);

    const [result] = await pool.query(
      `INSERT INTO habits (user_id, category_id, name, description, frequency, custom_days, reminder_time, color, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [req.user.id, category_id || null, name, description || null,
       frequency || 'daily', custom_days ? JSON.stringify(custom_days) : null,
       reminder_time || null, color || '#6366f1', icon || 'star']
    );

    const habitId = result.insertId;

    // Insert schedules if custom
    if (frequency === 'custom' && Array.isArray(custom_days) && custom_days.length) {
      for (const day of custom_days) {
        await pool.query(
          'INSERT INTO habit_schedules (habit_id, day_of_week, created_at) VALUES (?, ?, NOW())',
          [habitId, day]
        );
      }
    }

    const [habits] = await pool.query('SELECT * FROM habits WHERE id = ?', [habitId]);
    return success(res, habits[0], 'Habit created', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/habits/:id
exports.getHabit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/habits/:id
exports.updateHabit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);

    const allowed = ['name', 'description', 'frequency', 'custom_days', 'reminder_time', 'color', 'icon', 'category_id', 'is_active'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = key === 'custom_days' && typeof req.body[key] === 'object'
          ? JSON.stringify(req.body[key])
          : req.body[key];
      }
    }

    if (Object.keys(updates).length) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await pool.query(
        `UPDATE habits SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
        [...Object.values(updates), req.params.id]
      );
    }

    const [updated] = await pool.query('SELECT * FROM habits WHERE id = ?', [req.params.id]);
    return success(res, updated[0], 'Habit updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/habits/:id
exports.deleteHabit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);
    await pool.query('UPDATE habits SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    return success(res, null, 'Habit deleted');
  } catch (err) {
    next(err);
  }
};

// POST /api/habits/:id/complete
exports.completeHabit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);

    const today = todayUTC();
    try {
      const [result] = await pool.query(
        'INSERT INTO habit_completions (habit_id, user_id, completed_date, notes, created_at) VALUES (?, ?, ?, ?, NOW())',
        [req.params.id, req.user.id, today, req.body.notes || null]
      );
      return success(res, { completion_id: result.insertId, completed_date: today }, 'Habit completed', 201);
    } catch (dupErr) {
      if (dupErr.code === 'ER_DUP_ENTRY') {
        return error(res, 'Habit already completed today', 409);
      }
      throw dupErr;
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/habits/:id/complete
exports.uncompleteHabit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);

    const today = todayUTC();
    await pool.query(
      'DELETE FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completed_date = ?',
      [req.params.id, req.user.id, today]
    );
    return success(res, null, 'Completion removed');
  } catch (err) {
    next(err);
  }
};

// GET /api/habits/:id/history
exports.getHabitHistory = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);

    const ninetyDaysAgo = daysAgo(90);
    const [completions] = await pool.query(
      `SELECT completed_date, notes, created_at FROM habit_completions
       WHERE habit_id = ? AND user_id = ? AND completed_date >= ?
       ORDER BY completed_date DESC`,
      [req.params.id, req.user.id, ninetyDaysAgo]
    );
    return success(res, completions);
  } catch (err) {
    next(err);
  }
};

// GET /api/habits/:id/stats
exports.getHabitStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, created_at FROM habits WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Habit not found', 404);

    const habitId = req.params.id;
    const userId = req.user.id;

    // Total completions
    const [totalRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM habit_completions WHERE habit_id = ? AND user_id = ?',
      [habitId, userId]
    );

    // Last 30 days completion rate
    const thirtyAgo = daysAgo(30);
    const [last30] = await pool.query(
      'SELECT COUNT(*) AS count FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completed_date >= ?',
      [habitId, userId, thirtyAgo]
    );

    // Streak calculation — get all completion dates sorted desc
    const [dates] = await pool.query(
      'SELECT completed_date FROM habit_completions WHERE habit_id = ? AND user_id = ? ORDER BY completed_date DESC',
      [habitId, userId]
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    if (dates.length) {
      const today = new Date(todayUTC());
      let expected = new Date(dates[0].completed_date);

      // Check if today or yesterday to start streak
      const diff = Math.floor((today - expected) / 86400000);
      if (diff <= 1) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1].completed_date);
          const curr = new Date(dates[i].completed_date);
          const dayDiff = Math.floor((prev - curr) / 86400000);
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Best streak
      tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1].completed_date);
        const curr = new Date(dates[i].completed_date);
        if (Math.floor((prev - curr) / 86400000) === 1) {
          tempStreak++;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
      if (dates.length === 1) bestStreak = 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    }

    return success(res, {
      total_completions: totalRows[0].total,
      last_30_days: last30[0].count,
      completion_rate_30d: last30[0].count > 0 ? Math.round((last30[0].count / 30) * 100) : 0,
      current_streak: currentStreak,
      best_streak: bestStreak,
    });
  } catch (err) {
    next(err);
  }
};
