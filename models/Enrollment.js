const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    trackId: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    completedClasses: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

enrollmentSchema.index({ userId: 1, trackId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
