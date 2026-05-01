const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { isDatabaseConnected } = require("../utils/runtimeState");
const mockStore = require("../utils/mockStore");

const buildAuthResponse = (message, user) => ({
  message,
  token: generateToken(user._id || user.id),
  user: {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    purchasedTracks: user.purchasedTracks
  }
});

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!isDatabaseConnected()) {
    const existingUser = mockStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await mockStore.createUser({ name, email, password });
    return res.status(201).json(buildAuthResponse("Registration successful.", user));
  }

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

  res.status(201).json(buildAuthResponse("Registration successful.", user));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!isDatabaseConnected()) {
    const user = mockStore.findUserByEmail(email);

    if (!user || !(await mockStore.matchPassword(user, password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json(buildAuthResponse("Login successful.", user));
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json(buildAuthResponse("Login successful.", user));
};

module.exports = {
  registerUser,
  loginUser
};
