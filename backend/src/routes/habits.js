const express = require('express');
const router = express.Router();
const habitsController = require('../controllers/habitsController');
const auth = require('../middleware/auth');

router.get('/', auth, habitsController.listHabits);
router.post('/', auth, habitsController.createHabit);
router.get('/:id', auth, habitsController.getHabit);
router.put('/:id', auth, habitsController.updateHabit);
router.delete('/:id', auth, habitsController.deleteHabit);
router.post('/:id/complete', auth, habitsController.completeHabit);
router.delete('/:id/complete', auth, habitsController.uncompleteHabit);
router.get('/:id/history', auth, habitsController.getHabitHistory);
router.get('/:id/stats', auth, habitsController.getHabitStats);

module.exports = router;
