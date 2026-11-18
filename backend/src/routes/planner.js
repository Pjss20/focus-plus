const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/planner/events?day_of_week=N
router.get('/events', auth, async (req, res, next) => {
  try {
    const { day_of_week } = req.query;
    let sql = 'SELECT * FROM planner_events WHERE user_id=?';
    const params = [req.user.id];
    if (day_of_week !== undefined) { sql += ' AND day_of_week=?'; params.push(day_of_week); }
    sql += ' ORDER BY start_time';
    const [rows] = await pool.query(sql, params);
    success(res, rows);
  } catch (err) { next(err); }
});

// POST /api/planner/events
router.post('/events', auth, async (req, res, next) => {
  try {
    const { title, start_time, end_time, day_of_week, is_recurring, color, task_id } = req.body;
    if (!title || !start_time || !end_time) return error(res, 'Título, hora inicio y fin son obligatorios', 400);
    const [result] = await pool.query(
      'INSERT INTO planner_events (user_id, title, start_time, end_time, day_of_week, is_recurring, color, task_id) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, title, start_time, end_time, day_of_week ?? null, is_recurring || false, color || '#6366F1', task_id || null]
    );
    const [rows] = await pool.query('SELECT * FROM planner_events WHERE id=?', [result.insertId]);
    success(res, rows[0], 'Actividad creada', 201);
  } catch (err) { next(err); }
});

// PUT /api/planner/events/:id
router.put('/events/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM planner_events WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    const { title, start_time, end_time, day_of_week, is_recurring, color } = req.body;
    await pool.query(
      'UPDATE planner_events SET title=?, start_time=?, end_time=?, day_of_week=?, is_recurring=?, color=?, updated_at=NOW() WHERE id=?',
      [title, start_time, end_time, day_of_week, is_recurring, color, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM planner_events WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/planner/events/:id
router.delete('/events/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM planner_events WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    await pool.query('DELETE FROM planner_events WHERE id=?', [req.params.id]);
    success(res, null, 'Eliminado');
  } catch (err) { next(err); }
});

module.exports = router;
