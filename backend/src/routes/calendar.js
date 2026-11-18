const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success } = require('../utils/response');

// GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/events', auth, async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const uid = req.user.id;
    const events = [];

    // Habits (completed in range)
    const [hc] = await pool.query(
      `SELECT hc.completed_date as date, h.name as title, 'habit' as event_type, h.color
       FROM habit_completions hc JOIN habits h ON hc.habit_id = h.id
       WHERE hc.user_id=? AND hc.completed_date BETWEEN ? AND ?`,
      [uid, start, end]
    );
    events.push(...hc.map(e => ({ ...e, start_datetime: e.date })));

    // Tasks with due_date in range
    const [tasks] = await pool.query(
      `SELECT id, title, due_date as start_datetime, priority, 'task' as event_type FROM tasks
       WHERE user_id=? AND deleted_at IS NULL AND due_date BETWEEN ? AND ?`,
      [uid, start + ' 00:00:00', end + ' 23:59:59']
    );
    events.push(...tasks);

    // Exams
    const [exams] = await pool.query(
      `SELECT e.id, e.title, e.exam_date as start_datetime, 'exam' as event_type, s.color
       FROM exams e LEFT JOIN subjects s ON e.subject_id=s.id
       WHERE e.user_id=? AND e.exam_date BETWEEN ? AND ?`,
      [uid, start + ' 00:00:00', end + ' 23:59:59']
    );
    events.push(...exams);

    // Assignments
    const [assigns] = await pool.query(
      `SELECT a.id, a.title, a.due_date as start_datetime, 'assignment' as event_type, s.color
       FROM assignments a LEFT JOIN subjects s ON a.subject_id=s.id
       WHERE a.user_id=? AND a.due_date BETWEEN ? AND ?`,
      [uid, start + ' 00:00:00', end + ' 23:59:59']
    );
    events.push(...assigns);

    // Custom calendar events
    const [custom] = await pool.query(
      `SELECT id, title, start_datetime, end_datetime, color, event_type
       FROM calendar_events WHERE user_id=? AND start_datetime BETWEEN ? AND ?`,
      [uid, start + ' 00:00:00', end + ' 23:59:59']
    );
    events.push(...custom);

    success(res, events);
  } catch (err) { next(err); }
});

router.post('/events', auth, async (req, res, next) => {
  try {
    const { title, start_datetime, end_datetime, all_day, color, event_type, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO calendar_events (user_id, title, start_datetime, end_datetime, all_day, color, event_type, description) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, title, start_datetime, end_datetime || null, all_day || false, color || '#6366F1', event_type || 'custom', description || null]
    );
    const [rows] = await pool.query('SELECT * FROM calendar_events WHERE id=?', [result.insertId]);
    success(res, rows[0], 'Evento creado', 201);
  } catch (err) { next(err); }
});

router.delete('/events/:id', auth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM calendar_events WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    success(res, null, 'Eliminado');
  } catch (err) { next(err); }
});

module.exports = router;
