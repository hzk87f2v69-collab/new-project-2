const express = require("express");
const { body } = require("express-validator");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/create-order",
  protect,
  [
    body("trackIds").isArray({ min: 1 }).withMessage("Select at least one track."),
    body("bundleId").optional().isString().withMessage("Bundle ID must be a string.")
  ],
  validate,
  asyncHandler(createOrder)
);

router.post(
  "/verify",
  protect,
  [
    body("razorpay_order_id").notEmpty().withMessage("Order ID is required."),
    body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required."),
    body("razorpay_signature").notEmpty().withMessage("Payment signature is required.")
  ],
  validate,
  asyncHandler(verifyPayment)
);

module.exports = router;
