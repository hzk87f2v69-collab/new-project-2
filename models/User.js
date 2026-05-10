const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    bio: {
      type: String,
      default: "Athlete | Pro Trainer | Gym Enthusiast"
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ""
    },
    fitnessGoal: {
      type: String,
      trim: true,
      default: ""
    },
    age: {
      type: Number,
      min: 0,
      default: null
    },
    heightCm: {
      type: Number,
      min: 0,
      default: null
    },
    weightKg: {
      type: Number,
      min: 0,
      default: null
    },
    bodyFat: {
      type: Number,
      min: 0,
      default: null
    },
    muscleMass: {
      type: Number,
      min: 0,
      default: null
    },
    healthNotes: {
      type: String,
      trim: true,
      default: ""
    },
    activityLevel: {
      type: String,
      trim: true,
      default: ""
    },
    benchPR: {
      type: String,
      default: "0"
    },
    benchPRLabel: {
      type: String,
      default: "Bench PR"
    },
    deadliftPR: {
      type: String,
      default: "0"
    },
    deadliftPRLabel: {
      type: String,
      default: "Deadlift PR"
    },
    dietType: {
      type: String,
      trim: true,
      default: ""
    },
    allergies: {
      type: String,
      trim: true,
      default: ""
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    purchasedTracks: [
      {
        type: String
      }
    ],
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

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
