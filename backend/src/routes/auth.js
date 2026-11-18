const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register',
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  authController.register
);

// POST /api/auth/login
router.post('/login',
  loginLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  authController.login
);

// GET /api/auth/me
router.get('/me', auth, authController.me);

// POST /api/auth/logout
router.post('/logout', auth, authController.logout);

// POST /api/auth/forgot-password
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  authController.forgotPassword
);

// POST /api/auth/reset-password
router.post('/reset-password',
  body('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  authController.resetPassword
);

module.exports = router;
