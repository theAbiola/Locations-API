import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./db/db.js";
import locationRouter from "./routes/locationRoutes.js";
import { healthController } from "./controllers/healthController.js";

export const app = express();

const PORT = process.env.API_PORT;

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Important to parse incoming JSON requests

// Connect to the database
await connectDB();

app.use("/api/locations", locationRouter);

app.get("/health", healthController);

// Root endpoint
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to the Locations API",
    name: "Locations API",
    version: "1.0.0",
    status: "available",
    endpoints: {
      locations: "/api/locations",
      health: "/health",
    },
  });
});

// Catch-all route handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found. Please check the API documentation.",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  // Never expose internal error details in production
  res.status(500).json({
    success: false,
    message: "An error occurred in the server.",
    // only include error details in development mode
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on port http://localhost:${PORT}`);
});
