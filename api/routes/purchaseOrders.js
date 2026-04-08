const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const purchaseOrderController = require("../controllers/purchaseOrderController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

// Get all purchase orders
router.get(
  "/",
  checkPermission("view_inventory"),
  purchaseOrderController.getAll,
);

// Create purchase order (Pharmacist)
router.post(
  "/",
  [
    checkPermission("manage_inventory"),
    body("supplier_id").isInt().withMessage("Valid supplier ID is required"),
    body("order_date").isDate().withMessage("Valid order date is required"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.medicine_id")
      .isInt()
      .withMessage("Valid medicine ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Valid quantity is required"),
    body("items.*.unit_price")
      .isFloat({ min: 0 })
      .withMessage("Valid unit price is required"),
    validate,
  ],
  purchaseOrderController.create,
);

// Get single purchase order
router.get(
  "/:id",
  checkPermission("view_inventory"),
  purchaseOrderController.getOne,
);

// Supplier: Confirm order
router.post(
  "/:id/confirm",
  checkPermission("manage_inventory"),
  purchaseOrderController.confirmOrder,
);

// Supplier: Mark as delivered
router.post(
  "/:id/deliver",
  checkPermission("manage_inventory"),
  purchaseOrderController.markDelivered,
);

// Pharmacist: Receive stock
router.post(
  "/:id/receive",
  [
    checkPermission("manage_inventory"),
    body("items").isArray().withMessage("Items array is required"),
    validate,
  ],
  purchaseOrderController.receiveStock,
);

// Cancel order
router.post(
  "/:id/cancel",
  checkPermission("manage_inventory"),
  purchaseOrderController.cancel,
);

module.exports = router;
