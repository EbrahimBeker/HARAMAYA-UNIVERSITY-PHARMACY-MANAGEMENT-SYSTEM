const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const salesController = require("../controllers/salesController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

// Process new sale
router.post(
  "/",
  authorize("Pharmacist"),
  [
    body("payment_method")
      .equals("cash")
      .withMessage("Only cash payment is accepted"),
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
    body("total_amount")
      .isFloat({ min: 0 })
      .withMessage("Valid total amount is required"),
    validate,
  ],
  salesController.processSale,
);

// Get all sales
router.get("/", authorize("Pharmacist", "Admin"), salesController.getAllSales);

// Get single sale
router.get(
  "/:id",
  authorize("Pharmacist", "Admin"),
  salesController.getSaleById,
);

module.exports = router;
