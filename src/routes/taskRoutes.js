const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all tasks
router.get('/', taskController.getAllTasks);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Create a new task
router.post('/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),
    body('due_date').optional().isISO8601().withMessage('Due date must be a valid date')
  ],
  validateRequest,
  taskController.createTask
);

// Update a task
router.put('/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),
    body('due_date').optional().isISO8601().withMessage('Due date must be a valid date')
  ],
  validateRequest,
  taskController.updateTask
);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Assign a task to a user
router.put('/:id/assign',
  [
    body('assignee_id').notEmpty().withMessage('Assignee ID is required')
  ],
  validateRequest,
  taskController.assignTask
);

module.exports = router;