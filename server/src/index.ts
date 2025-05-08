import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { router as apiRouter } from "./routes/api";
import connectDB from "./config/db";
import errorHandler from "./middleware/error";
import { requestLogger } from "./middleware/requestLogger";
import { logger, stream } from "./config/logger";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Create a raw body parser for Stripe webhooks
app.use(
  ['/api/subscription/webhook', '/api/payments/webhook'],
  express.raw({ type: 'application/json', limit: '10mb' })
);

// Regular JSON parser for other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Add HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream }));

// Add detailed request/response logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Enable CORS with origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : [];

logger.info("Allowed origins: %o", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api", apiRouter);

// Basic route for testing
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to LocalConnect API - Local Services Marketplace",
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`, err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`, err);
  process.exit(1);
});

export default app;