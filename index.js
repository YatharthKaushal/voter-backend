import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configs/database.js";
import config from "./configs/config.js";
import adminRoutes from "./routes/adminAuth.routes.js";
import voterRoutes from "./routes/voter.routes.js";

dotenv.config();

const app = express();

// config cors polisy from config.js
app.use(
  cors({
    origin: config.CORS_ORIGIN, // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials if needed
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

//
app.get("/", (req, res) => {
  res.send(`Welcome to the Scheduling API! Environment: ${config.NODE_ENV}`);
});

// Admin Authentication Routes
// All routes starting with /api/admin will be handled by adminRoutes
app.use("/api/auth", adminRoutes);
app.use("/api/voters", voterRoutes);

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("? Something broke!");
});

// Start the server
app.listen(config.PORT, () => {
  console.log(
    `> Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );
  console.log(`> Access the API at http://localhost:${config.PORT}`);
});
