const Enrollment = require("../models/Enrollment");
const Track = require("../models/Track");
const Payment = require("../models/Payment");

const getEnrollments = async (req, res) => {
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
      completedClasses: enrollment.completedClasses.length,
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

const completeClass = async (req, res) => {
  const { trackId, classId } = req.body;
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
  getEnrollments,
  completeClass
};
