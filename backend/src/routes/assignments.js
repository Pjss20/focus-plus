const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, s.name as subject_name, s.color as subject_color
       FROM assignments a LEFT JOIN subjects s ON a.subject_id = s.id
       WHERE a.user_id = ? ORDER BY a.due_date`,
      [req.user.id]
    );
    success(res, rows);
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { title, subject_id, due_date, description, weight, status } = req.body;
    if (!title) return error(res, 'El título es obligatorio', 400);
    const [result] = await pool.query(
      'INSERT INTO assignments (user_id, subject_id, title, due_date, description, weight, status) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, subject_id || null, title, due_date || null, description || null, weight || null, status || 'pending']
    );
    const [rows] = await pool.query('SELECT * FROM assignments WHERE id=?', [result.insertId]);
    success(res, rows[0], 'Trabajo creado', 201);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM assignments WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    const { title, subject_id, due_date, description, status, score } = req.body;
    await pool.query(
      'UPDATE assignments SET title=?, subject_id=?, due_date=?, description=?, status=?, score=?, updated_at=NOW() WHERE id=?',
      [title, subject_id || null, due_date || null, description, status, score || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM assignments WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM assignments WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    await pool.query('DELETE FROM assignments WHERE id=?', [req.params.id]);
    success(res, null, 'Eliminado');
  } catch (err) { next(err); }
});

module.exports = router;
