const express = require("express");
const { body } = require("express-validator");
const { getProfile, updateProfile, getEnrollments, completeClass } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/profile", protect, asyncHandler(getProfile));
router.put(
  "/profile",
  protect,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Full name must be at least 2 characters."),
    body("phoneNumber").optional({ values: "falsy" }).trim().isLength({ min: 8, max: 20 }).withMessage("Phone or WhatsApp number should be between 8 and 20 digits."),
    body("fitnessGoal").optional({ values: "falsy" }).trim().isLength({ max: 120 }).withMessage("Fitness goal should be 120 characters or fewer."),
    body("age").optional({ values: "falsy" }).isFloat({ min: 1, max: 120 }).withMessage("Age should be between 1 and 120."),
    body("heightCm").optional({ values: "falsy" }).isFloat({ min: 30, max: 300 }).withMessage("Height should be between 30 and 300 cm."),
    body("weightKg").optional({ values: "falsy" }).isFloat({ min: 20, max: 500 }).withMessage("Weight should be between 20 and 500 kg."),
    body("healthNotes").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Health and injury notes should be 1000 characters or fewer.")
  ],
  validate,
  asyncHandler(updateProfile)
);
router.get("/enrollments", protect, asyncHandler(getEnrollments));
router.post(
  "/complete-class",
  protect,
  [
    body("trackId").notEmpty().withMessage("Track ID is required."),
    body("classId").notEmpty().withMessage("Class ID is required.")
  ],
  validate,
  asyncHandler(completeClass)
);

module.exports = router;
