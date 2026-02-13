const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getOne);

router.post('/', authorize('System Administrator', 'Pharmacist'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  validate
], supplierController.create);

router.put('/:id', authorize('System Administrator', 'Pharmacist'), supplierController.update);
router.delete('/:id', authorize('System Administrator', 'Pharmacist'), supplierController.delete);

module.exports = router;
