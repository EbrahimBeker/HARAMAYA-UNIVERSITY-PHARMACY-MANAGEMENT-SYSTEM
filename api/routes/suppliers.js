const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const supplierController = require("../controllers/supplierController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.use(authenticate);

router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getOne);

// Supplier: Get own supplier information
router.get(
  "/me/info",
  authorize("Drug Supplier"),
  supplierController.getMySupplierInfo,
);

// Supplier: Update own bank account
router.put(
  "/me/bank-account",
  authorize("Drug Supplier"),
  [
    body("bank_name")
      .isIn(["CBE", "Dashen Bank", "Awash Bank"])
      .withMessage("Invalid bank name"),
    body("account_number").notEmpty().withMessage("Account number is required"),
    body("account_holder_name")
      .notEmpty()
      .withMessage("Account holder name is required"),
    validate,
  ],
  supplierController.updateBankAccount,
);

router.post(
  "/",
  authorize("Admin", "Pharmacist"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    validate,
  ],
  supplierController.create,
);

router.put("/:id", authorize("Admin", "Pharmacist"), supplierController.update);
router.delete(
  "/:id",
  authorize("Admin", "Pharmacist"),
  supplierController.delete,
);

module.exports = router;
