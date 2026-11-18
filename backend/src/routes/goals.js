const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController');
const auth = require('../middleware/auth');

router.get('/', auth, goalsController.listGoals);
router.post('/', auth, goalsController.createGoal);
router.get('/:id', auth, goalsController.getGoal);
router.put('/:id', auth, goalsController.updateGoal);
router.delete('/:id', auth, goalsController.deleteGoal);
router.post('/:id/progress', auth, goalsController.addProgress);

module.exports = router;
