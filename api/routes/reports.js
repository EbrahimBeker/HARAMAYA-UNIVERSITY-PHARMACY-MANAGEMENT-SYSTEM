const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authenticate, checkPermission } = require("../middleware/auth");

router.use(authenticate);

// Dashboard statistics
router.get("/dashboard", reportController.getDashboardStats);

// Patient reports (Data Clerk, Admin)
router.get(
  "/patients",
  checkPermission("generate_patient_reports", "view_all_reports"),
  reportController.getPatientReport,
);

// Stock reports (Pharmacist, Admin)
router.get(
  "/stock",
  checkPermission("view_stock_reports", "view_all_reports"),
  reportController.getStockReport,
);

// Prescription reports (Physician, Pharmacist, Admin)
router.get(
  "/prescriptions",
  checkPermission("view_prescriptions", "view_all_reports"),
  reportController.getPrescriptionReport,
);

// Supplier reports (Admin, Pharmacist)
router.get(
  "/suppliers",
  checkPermission("view_supplier_reports", "view_all_reports"),
  reportController.getSupplierReport,
);

// System activity reports (Admin only)
router.get(
  "/activity",
  checkPermission("view_all_reports"),
  reportController.getSystemActivityReport,
);

module.exports = router;
