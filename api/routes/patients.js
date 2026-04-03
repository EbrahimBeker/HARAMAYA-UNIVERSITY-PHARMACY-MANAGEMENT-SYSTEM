const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const patientController = require("../controllers/patientController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

// Get all patients (Data Clerk, Physician)
router.get("/", checkPermission("view_patients"), patientController.getAll);

// Create new patient (Data Clerk)
router.post(
  "/",
  [
    checkPermission("register_patients"),
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("date_of_birth")
      .isDate()
      .withMessage("Valid date of birth is required"),
    body("gender")
      .isIn(["Male", "Female", "Other"])
      .withMessage("Valid gender is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    validate,
  ],
  patientController.create,
);

// Get single patient
router.get("/:id", checkPermission("view_patients"), patientController.getOne);

// Update patient (Data Clerk)
router.put(
  "/:id",
  checkPermission("update_patients"),
  patientController.update,
);

// Delete patient (Data Clerk)
router.delete(
  "/:id",
  checkPermission("update_patients"),
  patientController.delete,
);

// Get patient history (Physician, Data Clerk)
router.get(
  "/:id/history",
  checkPermission("view_patient_history", "view_patients"),
  patientController.getPatientHistory,
);

module.exports = router;
