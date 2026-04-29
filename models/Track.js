const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const weekSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    classes: [classSchema]
  },
  { _id: false }
);

const trackSchema = new mongoose.Schema(
  {
    trackId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    benefits: [
      {
        type: String
      }
    ],
    durationWeeks: {
      type: Number,
      required: true
    },
    classesCount: {
      type: Number,
      required: true
    },
    weeks: [weekSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Track", trackSchema);
