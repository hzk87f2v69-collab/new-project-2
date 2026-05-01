const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { trackSeed } = require("../data/tracks");

const users = [];
const enrollments = [];
const payments = [];
const inquiries = [];

const createId = () => crypto.randomUUID();

const getTrackById = (trackId) => trackSeed.find((track) => track.trackId === trackId);

const createSafeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  fitnessGoal: user.fitnessGoal,
  age: user.age,
  heightCm: user.heightCm,
  weightKg: user.weightKg,
  healthNotes: user.healthNotes,
  purchasedTracks: [...user.purchasedTracks],
  completedClasses: [...user.completedClasses],
  createdAt: user.createdAt
});

const createUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    _id: createId(),
    name: name.trim(),
    email: normalizedEmail,
    phoneNumber: "",
    fitnessGoal: "",
    age: null,
    heightCm: null,
    weightKg: null,
    healthNotes: "",
    passwordHash,
    purchasedTracks: [],
    completedClasses: [],
    createdAt: new Date()
  };

  users.push(user);
  return createSafeUser(user);
};

const findUserByEmail = (email) => users.find((user) => user.email === email.trim().toLowerCase()) || null;

const findUserById = (userId) => users.find((user) => user._id === String(userId)) || null;

const findSafeUserById = (userId) => {
  const user = findUserById(userId);
  return user ? createSafeUser(user) : null;
};

const matchPassword = async (user, candidatePassword) => bcrypt.compare(candidatePassword, user.passwordHash);

const listEnrollmentsByUser = (userId) =>
  enrollments
    .filter((enrollment) => enrollment.userId === String(userId))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

const listPaidPaymentsByUser = (userId) =>
  payments
    .filter((payment) => payment.userId === String(userId) && payment.status === "paid")
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

const recordPaidPayment = ({ userId, trackIds, amount, orderId, paymentId, signature }) => {
  const payment = {
    _id: createId(),
    userId: String(userId),
    trackIds: [...trackIds],
    amount,
    orderId,
    paymentId: paymentId || `demo_payment_${Date.now()}`,
    signature: signature || "demo-signature",
    status: "paid",
    createdAt: new Date()
  };

  payments.push(payment);
  return payment;
};

const grantTrackAccess = ({ userId, trackIds }) => {
  const user = findUserById(userId);
  if (!user) {
    throw new Error("User not found for this purchase.");
  }

  const unlockedTrackIds = [...new Set((trackIds || []).filter(Boolean))];
  user.purchasedTracks = [...new Set([...(user.purchasedTracks || []), ...unlockedTrackIds])];

  unlockedTrackIds.forEach((trackId) => {
    const existingEnrollment = enrollments.find(
      (enrollment) => enrollment.userId === user._id && enrollment.trackId === trackId
    );

    if (!existingEnrollment) {
      enrollments.push({
        _id: createId(),
        userId: user._id,
        trackId,
        progress: 0,
        completedClasses: [],
        createdAt: new Date()
      });
    }
  });

  return {
    user: createSafeUser(user),
    unlockedTrackIds
  };
};

const getEnrollmentDashboard = (userId) => {
  const user = findUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const userEnrollments = listEnrollmentsByUser(user._id);
  const enrollmentDetails = userEnrollments.map((enrollment) => {
    const track = getTrackById(enrollment.trackId);
    return {
      trackId: enrollment.trackId,
      name: track?.name,
      target: track?.target,
      progress: enrollment.progress,
      completedClasses: [...enrollment.completedClasses],
      totalClasses: track?.classesCount || 0,
      durationWeeks: track?.durationWeeks || 0
    };
  });

  return {
    profile: {
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt
    },
    purchasedTracks: [...user.purchasedTracks],
    completedClasses: [...user.completedClasses],
    enrollments: enrollmentDetails,
    paymentHistory: listPaidPaymentsByUser(user._id).map((payment) => ({
      ...payment
    }))
  };
};

const getUserProfile = (userId) => {
  const user = findUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  return {
    profile: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      fitnessGoal: user.fitnessGoal || "",
      age: user.age,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      healthNotes: user.healthNotes || "",
      joinedAt: user.createdAt
    }
  };
};

const updateUserProfile = (userId, payload) => {
  const user = findUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  user.name = payload.name.trim();
  user.phoneNumber = (payload.phoneNumber || "").trim();
  user.fitnessGoal = (payload.fitnessGoal || "").trim();
  user.age = payload.age ?? null;
  user.heightCm = payload.heightCm ?? null;
  user.weightKg = payload.weightKg ?? null;
  user.healthNotes = (payload.healthNotes || "").trim();

  return createSafeUser(user);
};

const completeClass = ({ userId, trackId, classId }) => {
  const user = findUserById(userId);
  const enrollment = enrollments.find(
    (enrollmentItem) => enrollmentItem.userId === String(userId) && enrollmentItem.trackId === trackId
  );
  const track = getTrackById(trackId);

  if (!user || !enrollment || !track) {
    throw new Error("Enrollment not found.");
  }

  const trackClassIds = track.weeks.flatMap((week) => week.classes.map((lesson) => lesson.classId));
  if (!trackClassIds.includes(classId)) {
    throw new Error("Invalid class selected.");
  }

  if (!enrollment.completedClasses.includes(classId)) {
    enrollment.completedClasses.push(classId);
  }

  if (!user.completedClasses.includes(classId)) {
    user.completedClasses.push(classId);
  }

  enrollment.progress = Math.round((enrollment.completedClasses.length / trackClassIds.length) * 100);

  return {
    progress: enrollment.progress,
    completedClasses: [...enrollment.completedClasses]
  };
};

const createInquiry = ({ name, email, message }) => {
  const inquiry = {
    _id: createId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    createdAt: new Date()
  };

  inquiries.push(inquiry);
  return inquiry;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findSafeUserById,
  matchPassword,
  grantTrackAccess,
  recordPaidPayment,
  getEnrollmentDashboard,
  getUserProfile,
  updateUserProfile,
  completeClass,
  createInquiry
};
