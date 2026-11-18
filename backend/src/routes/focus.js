const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/focus/sessions
router.get('/sessions', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT fs.*, t.title as task_title FROM focus_sessions fs
       LEFT JOIN tasks t ON fs.task_id = t.id
       WHERE fs.user_id=? ORDER BY fs.started_at DESC LIMIT 50`,
      [req.user.id]
    );
    success(res, rows);
  } catch (err) { next(err); }
});

// POST /api/focus/sessions
router.post('/sessions', auth, async (req, res, next) => {
  try {
    const { task_id, duration_minutes, type, started_at, notes } = req.body;
    const [result] = await pool.query(
      'INSERT INTO focus_sessions (user_id, task_id, duration_minutes, type, started_at, notes) VALUES (?,?,?,?,?,?)',
      [req.user.id, task_id || null, duration_minutes || 25, type || 'focus', started_at || new Date(), notes || null]
    );
    const [rows] = await pool.query('SELECT * FROM focus_sessions WHERE id=?', [result.insertId]);
    success(res, rows[0], 'Sesión iniciada', 201);
  } catch (err) { next(err); }
});

// PUT /api/focus/sessions/:id
router.put('/sessions/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM focus_sessions WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    const { is_completed, ended_at, notes } = req.body;
    await pool.query(
      'UPDATE focus_sessions SET is_completed=?, ended_at=?, notes=? WHERE id=?',
      [is_completed || false, ended_at || null, notes || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM focus_sessions WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

// GET /api/focus/stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const uid = req.user.id;
    const today = new Date().toISOString().slice(0, 10);
    const [todayStats] = await pool.query(
      `SELECT COALESCE(SUM(duration_minutes),0) as today_minutes, COUNT(*) as today_sessions
       FROM focus_sessions WHERE user_id=? AND DATE(started_at)=? AND is_completed=1`,
      [uid, today]
    );
    const [weekStats] = await pool.query(
      `SELECT COALESCE(SUM(duration_minutes),0) as week_minutes
       FROM focus_sessions WHERE user_id=? AND started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND is_completed=1`,
      [uid]
    );
    success(res, { today: todayStats[0], week: weekStats[0] });
  } catch (err) { next(err); }
});

module.exports = router;
