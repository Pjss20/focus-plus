const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/tasks
exports.listTasks = async (req, res, next) => {
  try {
    const { status, priority, category_id, search, sort } = req.query;

    let sql = `
      SELECT t.*,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id) AS subtask_count,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = TRUE) AS subtask_completed
      FROM tasks t
      WHERE t.user_id = ? AND t.deleted_at IS NULL
    `;
    const params = [req.user.id];

    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (priority) { sql += ' AND t.priority = ?'; params.push(priority); }
    if (category_id) { sql += ' AND t.category_id = ?'; params.push(category_id); }
    if (search) { sql += ' AND t.title LIKE ?'; params.push(`%${search}%`); }

    const sortMap = {
      due_date: 't.due_date ASC',
      priority: "FIELD(t.priority,'urgent','high','medium','low')",
      created: 't.created_at DESC',
      title: 't.title ASC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 't.created_at DESC'}`;

    const [rows] = await pool.query(sql, params);
    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, due_date, category_id, subject_id, sort_order } = req.body;
    if (!title) return error(res, 'Title is required', 400);

    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, category_id, subject_id, title, description, priority, status, due_date, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [req.user.id, category_id || null, subject_id || null, title, description || null,
       priority || 'medium', status || 'pending', due_date || null, sort_order || 0]
    );

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return success(res, tasks[0], 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);

    const [subtasks] = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC',
      [req.params.id]
    );

    return success(res, { ...rows[0], subtasks });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);

    const allowed = ['title', 'description', 'priority', 'status', 'due_date', 'category_id', 'subject_id', 'sort_order'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await pool.query(
        `UPDATE tasks SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
        [...Object.values(updates), req.params.id]
      );
    }

    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    return success(res, updated[0], 'Task updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);
    await pool.query('UPDATE tasks SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    return success(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/complete
exports.completeTask = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);
    await pool.query(
      "UPDATE tasks SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    return success(res, updated[0], 'Task completed');
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/subtasks
exports.createSubtask = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);

    const { title, sort_order } = req.body;
    if (!title) return error(res, 'Title is required', 400);

    const [result] = await pool.query(
      'INSERT INTO subtasks (task_id, title, sort_order, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [req.params.id, title, sort_order || 0]
    );
    const [subtask] = await pool.query('SELECT * FROM subtasks WHERE id = ?', [result.insertId]);
    return success(res, subtask[0], 'Subtask created', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id/subtasks/:subId
exports.updateSubtask = async (req, res, next) => {
  try {
    // Verify task ownership
    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);

    const { title, is_completed, sort_order } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (is_completed !== undefined) updates.is_completed = is_completed;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    if (Object.keys(updates).length) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await pool.query(
        `UPDATE subtasks SET ${setClauses}, updated_at = NOW() WHERE id = ? AND task_id = ?`,
        [...Object.values(updates), req.params.subId, req.params.id]
      );
    }

    const [subtask] = await pool.query('SELECT * FROM subtasks WHERE id = ?', [req.params.subId]);
    return success(res, subtask[0] || null, 'Subtask updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id/subtasks/:subId
exports.deleteSubtask = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return error(res, 'Task not found', 404);

    await pool.query('DELETE FROM subtasks WHERE id = ? AND task_id = ?', [req.params.subId, req.params.id]);
    return success(res, null, 'Subtask deleted');
  } catch (err) {
    next(err);
  }
};
