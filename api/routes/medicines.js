const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const medicineController = require('../controllers/medicineController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

router.use(authenticate);

router.get('/', medicineController.getAll);
router.get('/search', medicineController.search);
router.get('/:id', medicineController.getOne);

router.post('/', authorize('System Administrator', 'Pharmacist'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('category_id').isInt().withMessage('Category ID is required'),
  body('type_id').isInt().withMessage('Type ID is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  validate
], medicineController.create);

router.put('/:id', authorize('System Administrator', 'Pharmacist'), medicineController.update);
router.delete('/:id', authorize('System Administrator', 'Pharmacist'), medicineController.delete);

module.exports = router;
