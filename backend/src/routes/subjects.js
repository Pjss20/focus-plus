const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/subjects
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM subjects WHERE user_id = ? AND deleted_at IS NULL ORDER BY name',
      [req.user.id]
    );
    success(res, rows);
  } catch (err) { next(err); }
});

// POST /api/subjects
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, color, icon, teacher, classroom, credits } = req.body;
    if (!name) return error(res, 'El nombre es obligatorio', 400);
    const [result] = await pool.query(
      'INSERT INTO subjects (user_id, name, color, icon, teacher, classroom, credits) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, name, color || '#6366F1', icon || '📚', teacher || null, classroom || null, credits || null]
    );
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);
    success(res, rows[0], 'Asignatura creada', 201);
  } catch (err) { next(err); }
});

// PUT /api/subjects/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM subjects WHERE id=? AND user_id=? AND deleted_at IS NULL', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    const { name, color, icon, teacher, classroom, credits, is_active } = req.body;
    await pool.query(
      'UPDATE subjects SET name=?, color=?, icon=?, teacher=?, classroom=?, credits=?, is_active=?, updated_at=NOW() WHERE id=?',
      [name, color, icon, teacher, classroom, credits, is_active !== undefined ? is_active : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/subjects/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM subjects WHERE id=? AND user_id=? AND deleted_at IS NULL', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    await pool.query('UPDATE subjects SET deleted_at=NOW() WHERE id=?', [req.params.id]);
    success(res, null, 'Eliminado');
  } catch (err) { next(err); }
});

module.exports = router;
