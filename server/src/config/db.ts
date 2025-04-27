import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("MongoDB connected: %s", mongoose.connection.host);
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
