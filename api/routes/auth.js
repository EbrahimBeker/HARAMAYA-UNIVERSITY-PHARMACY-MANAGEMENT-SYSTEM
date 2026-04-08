const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validator");

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login,
);

router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

// Debug endpoint to check permissions
router.get("/debug/permissions", authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      roles: req.user.roles,
      permissions: req.user.permissions,
    },
  });
});

module.exports = router;
