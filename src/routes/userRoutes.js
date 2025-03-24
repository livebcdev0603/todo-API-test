const express  = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation Middleware
const createValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

]

const updateValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
]

//Routes
router.post('/', createValidation, validateRequest, userController.createUser);
router.put('/:id', updateValidation, validateRequest, userController.updateUser);
router.delete('/:id', validateRequest, userController.deleteUser);
router.get('/:id', validateRequest, userController.getUserById);


module.exports = router;