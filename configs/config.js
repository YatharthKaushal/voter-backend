import dotenv from "dotenv";

dotenv.config();

// Export the environment variables
const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development", // Provide a default in case it's not set
  PORT: process.env.PORT || 3000, // Provide a default
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "1h", // Provide a default
  // CORS_ORIGIN: process.env.CORS_ORIGIN || "*", // Allow all origins for development
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

// Optional: You can also add a check to ensure critical variables are set
if (!config.MONGODB_URI) {
  console.error("> Error: MONGODB_URI is not defined in .env");
  process.exit(1); // Exit the process if a critical variable is missing
}

if (!config.JWT_SECRET) {
  console.error("> Error: JWT_SECRET is not defined in .env");
  process.exit(1);
}

console.log(`> Environment: ${config.NODE_ENV}`);
console.log(`> Port: ${config.PORT}`);
// console.log(`MongoDB URI: ${config.MONGODB_URI}`); // Avoid logging sensitive info in production

export default config;
