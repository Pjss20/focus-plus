require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const habitRoutes = require('./src/routes/habits');
const taskRoutes = require('./src/routes/tasks');
const goalRoutes = require('./src/routes/goals');
const subjectRoutes = require('./src/routes/subjects');
const examRoutes = require('./src/routes/exams');
const assignmentRoutes = require('./src/routes/assignments');
const calendarRoutes = require('./src/routes/calendar');
const focusRoutes = require('./src/routes/focus');
const statisticsRoutes = require('./src/routes/statistics');
const achievementRoutes = require('./src/routes/achievements');
const noteRoutes = require('./src/routes/notes');
const notificationRoutes = require('./src/routes/notifications');
const plannerRoutes = require('./src/routes/planner');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Core Middleware ───────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/planner', plannerRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  // Run DB migrations before accepting traffic
  try {
    const { runMigrations } = require('./src/utils/migrate');
    await runMigrations();
  } catch (err) {
    console.error('❌ Migration failed — starting server anyway:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 FOCUS+ API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();

module.exports = app;
