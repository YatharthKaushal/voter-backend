import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // Other options can be added here if needed.
    });
    console.log("> MongoDB connected successfully");
  } catch (error) {
    console.error("> MongoDB connection error:", error.message);
    process.exit(1);
  }
}

export default connectDB;
