const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');

router.get('/settings', auth, usersController.getSettings);
router.put('/settings', auth, usersController.updateSettings);
router.put('/profile', auth, usersController.updateProfile);
router.delete('/account', auth, usersController.deleteAccount);

module.exports = router;
