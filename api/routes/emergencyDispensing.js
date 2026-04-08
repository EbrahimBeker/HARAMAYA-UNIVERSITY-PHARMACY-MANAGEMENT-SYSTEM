const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const emergencyDispensingController = require("../controllers/emergencyDispensingController");

// Create emergency dispensing (Pharmacist only)
router.post(
  "/",
  authenticate,
  authorize("Pharmacist", "Admin"),
  emergencyDispensingController.create,
);

// Get all emergency dispensing records
router.get("/", authenticate, emergencyDispensingController.getAll);

// Get pending emergency dispensing (awaiting prescription)
router.get("/pending", authenticate, emergencyDispensingController.getPending);

// Get one emergency dispensing record
router.get("/:id", authenticate, emergencyDispensingController.getOne);

// Link prescription to emergency dispensing (Physician only)
router.put(
  "/:id/link",
  authenticate,
  authorize("Physician", "Admin"),
  emergencyDispensingController.linkPrescription,
);

module.exports = router;
