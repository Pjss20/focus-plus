const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success } = require('../utils/response');

router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    success(res, rows);
  } catch (err) { next(err); }
});

router.put('/:id/read', auth, async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    success(res, null, 'Marcado como leído');
  } catch (err) { next(err); }
});

router.put('/read-all', auth, async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
    success(res, null, 'Todo marcado como leído');
  } catch (err) { next(err); }
});

module.exports = router;
