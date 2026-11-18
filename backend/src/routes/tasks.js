const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const auth = require('../middleware/auth');

router.get('/', auth, tasksController.listTasks);
router.post('/', auth, tasksController.createTask);
router.get('/:id', auth, tasksController.getTask);
router.put('/:id', auth, tasksController.updateTask);
router.delete('/:id', auth, tasksController.deleteTask);
router.post('/:id/complete', auth, tasksController.completeTask);
router.post('/:id/subtasks', auth, tasksController.createSubtask);
router.put('/:id/subtasks/:subId', auth, tasksController.updateSubtask);
router.delete('/:id/subtasks/:subId', auth, tasksController.deleteSubtask);

module.exports = router;
