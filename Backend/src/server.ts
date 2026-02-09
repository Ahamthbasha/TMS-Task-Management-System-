import dotenv from "dotenv";

if (process.env.NODE_ENV === "production") {
  dotenv.config();
} else {
  dotenv.config({ path: ".env.development" });
}

import express from "express";
import connectDB from "./config/db";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRouter from "./routes/userRouter"
import { errorHandler } from "./middlewares/errorMiddleware";



const requiredEnv = ["MONGO_URI"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
const port: number = Number(process.env.PORT) || 3000;

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || "http://localhost:5173",
].filter((url): url is string => Boolean(url));

const corsOptions: CorsOptions = {
  credentials: true,
  origin: allowedOrigins,
  methods: "GET,POST,PUT,PATCH,DELETE,HEAD",
};

// HTTP request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Middleware
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRouter);

// Health check route
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// 404 handler
app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use(errorHandler);

// Process-level error handling
process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Promise Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error.message);
  process.exit(1);
});

// Start server
const start = async (): Promise<void> => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`🌍 Frontend URLs: ${allowedOrigins.join(", ")}`);
      console.log(
        `📝 Logging mode: ${process.env.NODE_ENV || "development"}`
      );
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to start server:", errorMessage);
    process.exit(1);
  }
};

start();