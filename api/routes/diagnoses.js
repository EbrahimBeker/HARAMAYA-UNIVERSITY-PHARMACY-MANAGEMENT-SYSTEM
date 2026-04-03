const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const diagnosisController = require("../controllers/diagnosisController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

// Get all diagnoses
router.get("/", checkPermission("view_diagnosis"), diagnosisController.getAll);

// Create new diagnosis (Physician)
router.post(
  "/",
  [
    checkPermission("create_diagnosis"),
    body("patient_id").isInt().withMessage("Valid patient ID is required"),
    body("diagnosis_date")
      .isDate()
      .withMessage("Valid diagnosis date is required"),
    body("symptoms").notEmpty().withMessage("Symptoms are required"),
    body("diagnosis").notEmpty().withMessage("Diagnosis is required"),
    validate,
  ],
  diagnosisController.create,
);

// Get single diagnosis
router.get(
  "/:id",
  checkPermission("view_diagnosis"),
  diagnosisController.getOne,
);

// Update diagnosis (Physician)
router.put(
  "/:id",
  checkPermission("create_diagnosis"),
  diagnosisController.update,
);

// Get patient diagnoses
router.get(
  "/patient/:patientId",
  checkPermission("view_diagnosis", "view_patient_history"),
  diagnosisController.getPatientDiagnoses,
);

module.exports = router;
