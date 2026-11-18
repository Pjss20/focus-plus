const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { success } = require('../utils/response');

// GET /api/statistics?period=week|month|3months
router.get('/', auth, async (req, res, next) => {
  try {
    const uid = req.user.id;
    const { period = 'month' } = req.query;
    const days = period === 'week' ? 7 : period === '3months' ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    // Habits stats
    const [habitCompleted] = await pool.query(
      `SELECT COUNT(*) as completed_count FROM habit_completions WHERE user_id=? AND completed_date >= ?`,
      [uid, since]
    );
    const [streak] = await pool.query(
      `SELECT MAX(streak) as best_streak FROM (
        SELECT COUNT(*) as streak FROM habit_completions WHERE user_id=? AND completed_date >= ? GROUP BY completed_date
       ) s`, [uid, since]
    );
    // Current streak (consecutive days up to today)
    const [currentStreakRows] = await pool.query(
      `SELECT completed_date FROM habit_completions WHERE user_id=? GROUP BY completed_date ORDER BY completed_date DESC`,
      [uid]
    );
    let currentStreak = 0;
    let checkDate = new Date(today);
    for (const row of currentStreakRows) {
      const d = new Date(row.completed_date).toISOString().slice(0, 10);
      if (d === checkDate.toISOString().slice(0, 10)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    // Weekly activity (last 7 days)
    const [weeklyActivity] = await pool.query(
      `SELECT DATE(completed_date) as date, COUNT(DISTINCT habit_id) as completed,
              (SELECT COUNT(*) FROM habits WHERE user_id=? AND is_active=1 AND deleted_at IS NULL) as total
       FROM habit_completions WHERE user_id=? AND completed_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(completed_date) ORDER BY date`,
      [uid, uid]
    );
    const weeklyData = weeklyActivity.map(r => ({
      day: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(r.date).getDay()],
      date: r.date,
      completion_rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
    }));

    // Tasks stats
    const [taskStats] = await pool.query(
      `SELECT
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status='pending' OR status='in_progress' THEN 1 ELSE 0 END) as pending
       FROM tasks WHERE user_id=? AND deleted_at IS NULL`,
      [uid]
    );
    const [tasksByCat] = await pool.query(
      `SELECT c.name, COUNT(t.id) as count FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id=? AND t.deleted_at IS NULL AND t.status='completed' AND t.category_id IS NOT NULL
       GROUP BY c.id, c.name`,
      [uid]
    );

    // Goals stats
    const [goalStats] = await pool.query(
      `SELECT
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count
       FROM goals WHERE user_id=? AND deleted_at IS NULL`,
      [uid]
    );

    // Focus stats
    const [focusStats] = await pool.query(
      `SELECT COALESCE(SUM(duration_minutes),0) as total_minutes FROM focus_sessions
       WHERE user_id=? AND is_completed=1 AND started_at >= ?`,
      [uid, since]
    );
    const [focusToday] = await pool.query(
      `SELECT COALESCE(SUM(duration_minutes),0) as today_minutes FROM focus_sessions
       WHERE user_id=? AND DATE(started_at)=? AND is_completed=1`,
      [uid, today]
    );
    const [focusByDay] = await pool.query(
      `SELECT DAYNAME(started_at) as day, SUM(duration_minutes) as minutes FROM focus_sessions
       WHERE user_id=? AND is_completed=1 AND started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DAYNAME(started_at), DAYOFWEEK(started_at) ORDER BY DAYOFWEEK(started_at)`,
      [uid]
    );

    // Achievements
    const [achStats] = await pool.query(
      `SELECT COUNT(*) as unlocked_count FROM user_achievements WHERE user_id=?`, [uid]
    );

    success(res, {
      habits: {
        completed_count: habitCompleted[0].completed_count,
        current_streak: currentStreak,
        best_streak: streak[0]?.best_streak || 0,
        completion_rate: Math.round((habitCompleted[0].completed_count / Math.max(days, 1)) * 10) || 0,
        daily_completion: weeklyData,
      },
      tasks: { ...taskStats[0], by_category: tasksByCat },
      goals: goalStats[0],
      focus: { ...focusStats[0], today_minutes: focusToday[0].today_minutes, by_day: focusByDay },
      achievements: achStats[0],
      weekly_activity: weeklyData,
    });
  } catch (err) { next(err); }
});

module.exports = router;
