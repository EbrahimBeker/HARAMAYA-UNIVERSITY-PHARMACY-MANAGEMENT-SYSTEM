const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const backupController = require("../controllers/backupController");
const { authenticate, checkPermission } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);
router.use(checkPermission("backup_system", "restore_system"));

// Get all backups
router.get("/", backupController.getBackups);

// Create new backup
router.post(
  "/",
  [
    body("backup_type")
      .optional()
      .isIn(["Full", "Incremental", "Differential"])
      .withMessage("Invalid backup type"),
    validate,
  ],
  backupController.createBackup,
);

// Restore backup
router.post("/:id/restore", backupController.restoreBackup);

// Download backup
router.get("/:id/download", backupController.downloadBackup);

// Delete backup
router.delete("/:id", backupController.deleteBackup);

module.exports = router;
