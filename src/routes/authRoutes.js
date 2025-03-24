const express  = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation Middleware
const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
]

//Routes
router.post('/login', loginValidation, validateRequest, authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;