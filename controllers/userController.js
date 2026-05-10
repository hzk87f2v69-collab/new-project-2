const Enrollment = require("../models/Enrollment");
const Track = require("../models/Track");
const Payment = require("../models/Payment");
const { isDatabaseConnected } = require("../utils/runtimeState");
const mockStore = require("../utils/mockStore");

const buildProfileResponse = (user) => ({
  profile: {
    name: user.name,
    avatar: user.avatar || "",
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    fitnessGoal: user.fitnessGoal || "",
    age: user.age ?? null,
    heightCm: user.heightCm ?? null,
    weightKg: user.weightKg ?? null,
    bodyFat: user.bodyFat ?? null,
    muscleMass: user.muscleMass ?? null,
    healthNotes: user.healthNotes || "",
    activityLevel: user.activityLevel || "",
    dietType: user.dietType || "",
    allergies: user.allergies || "",
    benchPR: user.benchPR || "0",
    deadliftPR: user.deadliftPR || "0",
    joinedAt: user.createdAt
  }
});

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getProfile = async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(mockStore.getUserProfile(req.user._id));
  }

  res.json(buildProfileResponse(req.user));
};

const getEnrollments = async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(mockStore.getEnrollmentDashboard(req.user._id));
  }

  const enrollments = await Enrollment.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const trackIds = enrollments.map((enrollment) => enrollment.trackId);
  const tracks = await Track.find({ trackId: { $in: trackIds } });
  const payments = await Payment.find({ userId: req.user._id, status: "paid" }).sort({ createdAt: -1 });

  const trackMap = new Map(tracks.map((track) => [track.trackId, track]));

  const enrollmentDetails = enrollments.map((enrollment) => {
    const track = trackMap.get(enrollment.trackId);
    return {
      trackId: enrollment.trackId,
      name: track?.name,
      target: track?.target,
      progress: enrollment.progress,
      completedClasses: enrollment.completedClasses,
      totalClasses: track?.classesCount || 0,
      durationWeeks: track?.durationWeeks || 0
    };
  });

  res.json({
    profile: {
      name: req.user.name,
      email: req.user.email,
      joinedAt: req.user.createdAt
    },
    purchasedTracks: req.user.purchasedTracks,
    completedClasses: req.user.completedClasses,
    enrollments: enrollmentDetails,
    paymentHistory: payments
  });
};

const updateProfile = async (req, res) => {
  const payload = {
    name: req.body.name.trim(),
    avatar: req.body.avatar || "",
    phoneNumber: (req.body.phoneNumber || "").trim(),
    fitnessGoal: (req.body.fitnessGoal || "").trim(),
    age: parseOptionalNumber(req.body.age),
    heightCm: parseOptionalNumber(req.body.heightCm),
    weightKg: parseOptionalNumber(req.body.weightKg),
    bodyFat: parseOptionalNumber(req.body.bodyFat),
    muscleMass: parseOptionalNumber(req.body.muscleMass),
    healthNotes: (req.body.healthNotes || "").trim(),
    activityLevel: (req.body.activityLevel || "").trim(),
    dietType: (req.body.dietType || "").trim(),
    allergies: (req.body.allergies || "").trim(),
    benchPR: (req.body.benchPR || "0").trim(),
    deadliftPR: (req.body.deadliftPR || "0").trim()
  };

  if (!isDatabaseConnected()) {
    const user = mockStore.updateUserProfile(req.user._id, payload);
    return res.json({
      message: "Profile updated successfully.",
      ...buildProfileResponse(user)
    });
  }

  req.user.name = payload.name;
  req.user.avatar = payload.avatar;
  req.user.phoneNumber = payload.phoneNumber;
  req.user.fitnessGoal = payload.fitnessGoal;
  req.user.age = payload.age;
  req.user.heightCm = payload.heightCm;
  req.user.weightKg = payload.weightKg;
  req.user.bodyFat = payload.bodyFat;
  req.user.muscleMass = payload.muscleMass;
  req.user.healthNotes = payload.healthNotes;
  req.user.activityLevel = payload.activityLevel;
  req.user.dietType = payload.dietType;
  req.user.allergies = payload.allergies;
  req.user.benchPR = payload.benchPR;
  req.user.deadliftPR = payload.deadliftPR;
  await req.user.save();

  res.json({
    message: "Profile updated successfully.",
    ...buildProfileResponse(req.user)
  });
};

const completeClass = async (req, res) => {
  const { trackId, classId } = req.body;

  if (!isDatabaseConnected()) {
    try {
      const response = mockStore.completeClass({ userId: req.user._id, trackId, classId });
      return res.json({
        message: "Class marked complete.",
        progress: response.progress,
        completedClasses: response.completedClasses
      });
    } catch (error) {
      const statusCode = error.message === "Invalid class selected." ? 400 : 404;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  const enrollment = await Enrollment.findOne({ userId: req.user._id, trackId });
  const track = await Track.findOne({ trackId });

  if (!enrollment || !track) {
    return res.status(404).json({ message: "Enrollment not found." });
  }

  const trackClassIds = track.weeks.flatMap((week) => week.classes.map((item) => item.classId));
  if (!trackClassIds.includes(classId)) {
    return res.status(400).json({ message: "Invalid class selected." });
  }

  if (!enrollment.completedClasses.includes(classId)) {
    enrollment.completedClasses.push(classId);
  }

  if (!req.user.completedClasses.includes(classId)) {
    req.user.completedClasses.push(classId);
  }

  enrollment.progress = Math.round((enrollment.completedClasses.length / trackClassIds.length) * 100);

  await enrollment.save();
  await req.user.save();

  res.json({
    message: "Class marked complete.",
    progress: enrollment.progress,
    completedClasses: enrollment.completedClasses
  });
};

module.exports = {
  getProfile,
  updateProfile,
  getEnrollments,
  completeClass
};
