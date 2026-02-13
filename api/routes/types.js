const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const typeController = require('../controllers/typeController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

router.use(authenticate);

router.get('/', typeController.getAll);

router.post('/', authorize('System Administrator', 'Pharmacist'), [
  body('name').notEmpty().withMessage('Name is required'),
  validate
], typeController.create);

router.put('/:id', authorize('System Administrator', 'Pharmacist'), typeController.update);
router.delete('/:id', authorize('System Administrator', 'Pharmacist'), typeController.delete);

module.exports = router;
