const express = require("express");
const { body } = require("express-validator");
const { getEnrollments, completeClass } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

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
