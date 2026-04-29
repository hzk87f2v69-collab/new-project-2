const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    trackIds: [
      {
        type: String,
        required: true
      }
    ],
    amount: {
      type: Number,
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    paymentId: {
      type: String
    },
    signature: {
      type: String
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
