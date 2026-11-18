const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success } = require('../utils/response');

// GET /api/achievements
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, ua.unlocked_at FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       ORDER BY ua.unlocked_at DESC, a.points DESC`,
      [req.user.id]
    );
    success(res, rows);
  } catch (err) { next(err); }
});

// POST /api/achievements/check — run achievement logic
router.post('/check', auth, async (req, res, next) => {
  try {
    const uid = req.user.id;
    const unlocked = [];

    // Check: first habit completed
    const [hc] = await pool.query('SELECT COUNT(*) as cnt FROM habit_completions WHERE user_id=?', [uid]);
    if (hc[0].cnt >= 1) await unlockIfNew(uid, 'first_habit', pool, unlocked);

    // Check: 7-day streak
    const [streak7] = await pool.query(
      `SELECT COUNT(DISTINCT completed_date) as cnt FROM habit_completions
       WHERE user_id=? AND completed_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`, [uid]
    );
    if (streak7[0].cnt >= 7) await unlockIfNew(uid, 'week_streak', pool, unlocked);

    // Check: first task completed
    const [tc] = await pool.query(`SELECT COUNT(*) as cnt FROM tasks WHERE user_id=? AND status='completed'`, [uid]);
    if (tc[0].cnt >= 1) await unlockIfNew(uid, 'first_task', pool, unlocked);

    // Check: first focus session
    const [fc] = await pool.query('SELECT COUNT(*) as cnt FROM focus_sessions WHERE user_id=? AND is_completed=1', [uid]);
    if (fc[0].cnt >= 1) await unlockIfNew(uid, 'first_focus', pool, unlocked);

    // Check: first note
    const [nc] = await pool.query('SELECT COUNT(*) as cnt FROM notes WHERE user_id=? AND deleted_at IS NULL', [uid]);
    if (nc[0].cnt >= 1) await unlockIfNew(uid, 'first_note', pool, unlocked);

    // Update XP
    if (unlocked.length > 0) {
      const [points] = await pool.query(
        'SELECT SUM(points) as total FROM achievements WHERE slug IN (?)', [unlocked]
      );
      await pool.query(
        'UPDATE users SET experience_points = experience_points + ? WHERE id=?',
        [points[0].total || 0, uid]
      );
    }

    success(res, { unlocked });
  } catch (err) { next(err); }
});

async function unlockIfNew(userId, slug, pool, unlocked) {
  const [ach] = await pool.query('SELECT id FROM achievements WHERE slug=?', [slug]);
  if (!ach.length) return;
  const [exists] = await pool.query('SELECT id FROM user_achievements WHERE user_id=? AND achievement_id=?', [userId, ach[0].id]);
  if (!exists.length) {
    await pool.query('INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)', [userId, ach[0].id]);
    unlocked.push(slug);
  }
}

module.exports = router;
