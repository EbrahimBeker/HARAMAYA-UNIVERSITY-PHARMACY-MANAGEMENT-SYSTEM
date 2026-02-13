const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

router.use(authenticate);
router.use(authorize('System Administrator'));

router.get('/', userController.getAll);

router.post('/', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('role_ids').isArray().withMessage('Role IDs must be an array'),
  validate
], userController.create);

router.get('/:id', userController.getOne);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
