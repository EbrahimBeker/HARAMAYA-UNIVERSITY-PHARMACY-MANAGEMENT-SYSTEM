const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

router.use(authenticate);

router.get('/', categoryController.getAll);

router.post('/', authorize('System Administrator', 'Pharmacist'), [
  body('name').notEmpty().withMessage('Name is required'),
  validate
], categoryController.create);

router.put('/:id', authorize('System Administrator', 'Pharmacist'), categoryController.update);
router.delete('/:id', authorize('System Administrator', 'Pharmacist'), categoryController.delete);

module.exports = router;
