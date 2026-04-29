const crypto = require("crypto");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const Track = require("../models/Track");
const User = require("../models/User");
const razorpay = require("../utils/razorpay");
const { bundleSeed } = require("../data/tracks");

const calculateOrder = async (selection) => {
  const { trackIds, bundleId } = selection;
  const uniqueTrackIds = [...new Set(trackIds || [])];

  if (bundleId === "duo") {
    if (!Array.isArray(uniqueTrackIds) || uniqueTrackIds.length !== 2) {
      throw new Error("Pick exactly 2 tracks for the duo bundle.");
    }

    const tracks = await Track.find({ trackId: { $in: uniqueTrackIds } }).select("trackId");
    if (tracks.length !== uniqueTrackIds.length) {
      throw new Error("One or more selected tracks are invalid.");
    }

    const bundle = bundleSeed.find((item) => item.bundleId === bundleId);
    return {
      trackIds: uniqueTrackIds,
      amount: bundle.price
    };
  }

  if (bundleId === "all-access") {
    const tracks = await Track.find().select("trackId");
    const bundle = bundleSeed.find((item) => item.bundleId === bundleId);
    return {
      trackIds: tracks.map((track) => track.trackId),
      amount: bundle.price
    };
  }

  if (!Array.isArray(uniqueTrackIds) || uniqueTrackIds.length === 0) {
    throw new Error("Select at least one track.");
  }

  const tracks = await Track.find({ trackId: { $in: uniqueTrackIds } });

  if (tracks.length !== uniqueTrackIds.length) {
    throw new Error("One or more selected tracks are invalid.");
  }

  const amount = tracks.reduce((sum, track) => sum + track.price, 0);
  return { trackIds: uniqueTrackIds, amount };
};

const createOrder = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ message: "Razorpay keys are missing in environment config." });
  }

  const selectedOrder = await calculateOrder(req.body);
  const { trackIds, bundleId, amount } = selectedOrder;
  const alreadyOwned = trackIds.filter((trackId) => req.user.purchasedTracks.includes(trackId));

  if (alreadyOwned.length === trackIds.length) {
    return res.status(400).json({ message: "You already own the selected track(s)." });
  }

  if (alreadyOwned.length > 0) {
    return res.status(400).json({
      message: `You already own: ${alreadyOwned.join(", ")}. Remove them before checkout.`
    });
  }

  const receipt = `ace_${Date.now()}`;

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt,
    notes: {
      userId: req.user._id.toString(),
      trackIds: JSON.stringify(trackIds),
      bundleId: bundleId || "single"
    }
  });

  await Payment.create({
    userId: req.user._id,
    trackIds: selectedOrder.trackIds,
    amount: selectedOrder.amount,
    orderId: order.id,
    status: "created"
  });

  res.status(201).json({
    key: process.env.RAZORPAY_KEY_ID,
    order: {
      id: order.id,
      amount: order.amount,
      currency: "INR",
      trackIds: selectedOrder.trackIds
    }
  });
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: "failed", paymentId: razorpay_payment_id, signature: razorpay_signature }
    );
    return res.status(400).json({ message: "Payment signature verification failed." });
  }

  const paymentRecord = await Payment.findOne({ orderId: razorpay_order_id });
  if (!paymentRecord) {
    return res.status(404).json({ message: "Payment record not found." });
  }

  paymentRecord.status = "paid";
  paymentRecord.paymentId = razorpay_payment_id;
  paymentRecord.signature = razorpay_signature;
  await paymentRecord.save();

  const user = await User.findById(paymentRecord.userId);
  const uniqueTracks = [...new Set([...user.purchasedTracks, ...paymentRecord.trackIds])];
  user.purchasedTracks = uniqueTracks;
  await user.save();

  await Promise.all(
    paymentRecord.trackIds.map(async (trackId) => {
      const existing = await Enrollment.findOne({ userId: user._id, trackId });
      if (!existing) {
        await Enrollment.create({
          userId: user._id,
          trackId,
          progress: 0,
          completedClasses: []
        });
      }
    })
  );

  res.json({
    message: "Payment verified and course unlocked.",
    purchasedTracks: user.purchasedTracks
  });
};

module.exports = {
  createOrder,
  verifyPayment
};
