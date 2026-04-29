const express = require("express");
const { body } = require("express-validator");
const { createInquiry } = require("../controllers/contactController");
const validate = require("../middleware/validateMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").isEmail().withMessage("Enter a valid email."),
    body("message")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message should be between 10 and 1000 characters.")
  ],
  validate,
  asyncHandler(createInquiry)
);

module.exports = router;
