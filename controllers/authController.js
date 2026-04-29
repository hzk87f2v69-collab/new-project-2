const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const user = await User.create({
    name,
    email,
    password,
    purchasedTracks: [],
    completedClasses: []
  });

  res.status(201).json({
    message: "Registration successful.",
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      purchasedTracks: user.purchasedTracks
    }
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    message: "Login successful.",
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      purchasedTracks: user.purchasedTracks
    }
  });
};

module.exports = {
  registerUser,
  loginUser
};
