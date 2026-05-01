const mongoose = require("mongoose");
const { setDatabaseConnected } = require("./runtimeState");

const connectDB = async () => {
  try {
    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    setDatabaseConnected(true);
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    setDatabaseConnected(false);
    console.error("MongoDB connection failed:", error.message);
    return null;
  }
};

module.exports = connectDB;
