const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/authController");
const validate = require("../middleware/validateMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").isEmail().withMessage("Enter a valid email."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long.")
  ],
  validate,
  asyncHandler(registerUser)
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validate,
  asyncHandler(loginUser)
);

module.exports = router;
