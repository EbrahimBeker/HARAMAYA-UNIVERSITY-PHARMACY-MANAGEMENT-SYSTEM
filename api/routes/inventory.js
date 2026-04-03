const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const inventoryController = require("../controllers/inventoryController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

// Get current stock levels
router.get(
  "/stock",
  checkPermission("view_medicines", "manage_inventory"),
  inventoryController.getCurrentStock,
);

// Receive stock (Pharmacist)
router.post(
  "/receive",
  [
    checkPermission("receive_stock"),
    body("medicine_id").isInt().withMessage("Valid medicine ID is required"),
    body("supplier_id").isInt().withMessage("Valid supplier ID is required"),
    body("batch_number").notEmpty().withMessage("Batch number is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Valid quantity is required"),
    body("unit_cost").isDecimal().withMessage("Valid unit cost is required"),
    body("expiry_date").isDate().withMessage("Valid expiry date is required"),
    validate,
  ],
  inventoryController.receiveStock,
);

// Get stock movements
router.get(
  "/movements",
  checkPermission("manage_inventory"),
  inventoryController.getStockMovements,
);

// Get expiring medicines
router.get(
  "/expiring",
  checkPermission("manage_inventory"),
  inventoryController.getExpiringMedicines,
);

// Adjust stock (Pharmacist)
router.post(
  "/adjust",
  [
    checkPermission("update_stock"),
    body("medicine_id").isInt().withMessage("Valid medicine ID is required"),
    body("adjustment_type")
      .isIn(["increase", "decrease"])
      .withMessage("Valid adjustment type is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Valid quantity is required"),
    body("reason").notEmpty().withMessage("Reason is required"),
    validate,
  ],
  inventoryController.adjustStock,
);

module.exports = router;
