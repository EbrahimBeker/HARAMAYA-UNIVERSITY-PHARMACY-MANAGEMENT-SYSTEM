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
    body("medicine_id")
      .isInt({ min: 1 })
      .withMessage("Valid medicine ID is required"),
    body("supplier_id")
      .isInt({ min: 1 })
      .withMessage("Valid supplier ID is required"),
    body("batch_number")
      .trim()
      .notEmpty()
      .withMessage("Batch number is required")
      .isLength({ max: 100 })
      .withMessage("Batch number must not exceed 100 characters")
      .matches(/^[A-Za-z0-9-]+$/)
      .withMessage(
        "Batch number can only contain letters, numbers, and hyphens",
      ),
    body("quantity")
      .isInt({ min: 1, max: 1000000 })
      .withMessage("Quantity must be between 1 and 1,000,000"),
    body("unit_cost")
      .isFloat({ min: 0.01, max: 100000 })
      .withMessage("Unit cost must be between 0.01 and 100,000"),
    body("expiry_date")
      .isDate()
      .withMessage("Valid expiry date is required")
      .custom((value) => {
        const expiryDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiryDate <= today) {
          throw new Error("Expiry date must be in the future");
        }
        return true;
      }),
    body("manufacture_date")
      .optional()
      .isDate()
      .withMessage("Valid manufacture date required")
      .custom((value, { req }) => {
        if (value) {
          const manufactureDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (manufactureDate > today) {
            throw new Error("Manufacture date cannot be in the future");
          }

          if (req.body.expiry_date) {
            const expiryDate = new Date(req.body.expiry_date);
            if (manufactureDate >= expiryDate) {
              throw new Error("Manufacture date must be before expiry date");
            }
          }
        }
        return true;
      }),
    body("purchase_order_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid purchase order ID required"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes must not exceed 1000 characters"),
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
