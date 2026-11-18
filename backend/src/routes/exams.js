const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/exams
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, s.name as subject_name, s.color as subject_color
       FROM exams e LEFT JOIN subjects s ON e.subject_id = s.id
       WHERE e.user_id = ? ORDER BY e.exam_date`,
      [req.user.id]
    );
    success(res, rows);
  } catch (err) { next(err); }
});

// POST /api/exams
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, subject_id, exam_date, location, description, weight } = req.body;
    if (!title || !exam_date) return error(res, 'Título y fecha son obligatorios', 400);
    const [result] = await pool.query(
      'INSERT INTO exams (user_id, subject_id, title, exam_date, location, description, weight) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, subject_id || null, title, exam_date, location || null, description || null, weight || null]
    );
    const [rows] = await pool.query('SELECT * FROM exams WHERE id=?', [result.insertId]);
    success(res, rows[0], 'Examen creado', 201);
  } catch (err) { next(err); }
});

// PUT /api/exams/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM exams WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    const { title, subject_id, exam_date, location, description, status, score } = req.body;
    await pool.query(
      'UPDATE exams SET title=?, subject_id=?, exam_date=?, location=?, description=?, status=?, score=?, updated_at=NOW() WHERE id=?',
      [title, subject_id || null, exam_date, location, description, status || 'upcoming', score || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM exams WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/exams/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM exams WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    await pool.query('DELETE FROM exams WHERE id=?', [req.params.id]);
    success(res, null, 'Eliminado');
  } catch (err) { next(err); }
});

module.exports = router;
