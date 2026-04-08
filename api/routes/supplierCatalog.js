const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body } = require("express-validator");
const supplierCatalogController = require("../controllers/supplierCatalogController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) and CSV files are allowed"));
    }
  },
});

router.use(authenticate);

// Get catalog items
router.get("/", supplierCatalogController.getAll);

// Get catalog statistics
router.get("/stats", supplierCatalogController.getStats);

// Add/Update catalog item
router.post(
  "/",
  [
    body("supplier_id").isInt().withMessage("Valid supplier ID is required"),
    body("medicine_id").isInt().withMessage("Valid medicine ID is required"),
    body("unit_price")
      .isFloat({ min: 0 })
      .withMessage("Valid unit price is required"),
    body("quantity_available")
      .isInt({ min: 0 })
      .withMessage("Valid quantity is required"),
    validate,
  ],
  supplierCatalogController.upsert,
);

// Bulk upload from Excel
router.post(
  "/bulk-upload",
  upload.single("file"),
  supplierCatalogController.bulkUpload,
);

// Delete catalog item
router.delete("/:id", supplierCatalogController.delete);

module.exports = router;
