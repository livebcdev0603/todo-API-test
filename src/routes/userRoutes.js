const express = require('express');
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create a new user
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validateRequest,
  userController.createUser
);

// Update a user
router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required')
  ],
  validateRequest,
  userController.updateUser
);

// Delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;