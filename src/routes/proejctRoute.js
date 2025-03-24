const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation middleware
const createProjectValidation = [
  body('name').notEmpty().withMessage('Project name is required')
];

const addTaskValidation = [
  body('task_id').notEmpty().withMessage('Task ID is required')
];

// Routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', createProjectValidation, validateRequest, projectController.createProject);
router.put('/:id/tasks', addTaskValidation, validateRequest, projectController.addTaskToProject);

module.exports = router;