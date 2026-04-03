const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const prescriptionController = require("../controllers/prescriptionController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

// Get all prescriptions
router.get(
  "/",
  checkPermission("view_prescriptions"),
  prescriptionController.getAll,
);

// Create new prescription (Physician)
router.post(
  "/",
  [
    checkPermission("create_prescription"),
    body("patient_id").isInt().withMessage("Valid patient ID is required"),
    body("prescription_date")
      .isDate()
      .withMessage("Valid prescription date is required"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one prescription item is required"),
    body("items.*.medicine_id")
      .isInt()
      .withMessage("Valid medicine ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Valid quantity is required"),
    body("items.*.dosage").notEmpty().withMessage("Dosage is required"),
    body("items.*.frequency").notEmpty().withMessage("Frequency is required"),
    body("items.*.duration").notEmpty().withMessage("Duration is required"),
    validate,
  ],
  prescriptionController.create,
);

// Get single prescription
router.get(
  "/:id",
  checkPermission("view_prescriptions"),
  prescriptionController.getOne,
);

// Dispense prescription (Pharmacist)
router.post(
  "/:id/dispense",
  [
    checkPermission("dispense_medicines"),
    body("dispensed_items")
      .isArray()
      .withMessage("Dispensed items array is required"),
    validate,
  ],
  prescriptionController.dispense,
);

// Get pending prescriptions (Pharmacist)
router.get(
  "/status/pending",
  checkPermission("view_prescriptions"),
  prescriptionController.getPendingPrescriptions,
);

module.exports = router;
