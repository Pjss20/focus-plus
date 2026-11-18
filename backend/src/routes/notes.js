const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success, error } = require('../utils/response');

// GET /api/notes?search=...
router.get('/', auth, async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM notes WHERE user_id=? AND deleted_at IS NULL';
    const params = [req.user.id];
    if (search) { sql += ' AND (title LIKE ? OR content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY is_pinned DESC, updated_at DESC';
    const [rows] = await pool.query(sql, params);
    success(res, rows);
  } catch (err) { next(err); }
});

// POST /api/notes
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, content, color, is_pinned } = req.body;
    const [result] = await pool.query(
      'INSERT INTO notes (user_id, title, content, color, is_pinned) VALUES (?,?,?,?,?)',
      [req.user.id, title || null, content || '', color || '#FFFFFF', is_pinned || false]
    );
    const [rows] = await pool.query('SELECT * FROM notes WHERE id=?', [result.insertId]);
    success(res, rows[0], 'Nota creada', 201);
  } catch (err) { next(err); }
});

// PUT /api/notes/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM notes WHERE id=? AND user_id=? AND deleted_at IS NULL', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    const { title, content, color, is_pinned } = req.body;
    await pool.query('UPDATE notes SET title=?, content=?, color=?, is_pinned=?, updated_at=NOW() WHERE id=?',
      [title, content, color, is_pinned || false, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM notes WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/notes/:id/pin — toggle pin
router.put('/:id/pin', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id, is_pinned FROM notes WHERE id=? AND user_id=? AND deleted_at IS NULL', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    await pool.query('UPDATE notes SET is_pinned=?, updated_at=NOW() WHERE id=?', [!own[0].is_pinned, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM notes WHERE id=?', [req.params.id]);
    success(res, rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [own] = await pool.query('SELECT id FROM notes WHERE id=? AND user_id=? AND deleted_at IS NULL', [req.params.id, req.user.id]);
    if (!own.length) return error(res, 'No encontrado', 404);
    await pool.query('UPDATE notes SET deleted_at=NOW() WHERE id=?', [req.params.id]);
    success(res, null, 'Eliminado');
  } catch (err) { next(err); }
});

module.exports = router;
