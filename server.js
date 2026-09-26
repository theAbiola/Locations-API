import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./db/db.js";
import locationRouter from "./routes/locationRoutes.js";

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

await connectDB();

app.use("/api/locations", locationRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Locations API"); //refactor later to render an actual static webpage that contains the API documentation.
  //api documentation currently in progress
});

// catch-all middleware for unsupported endpoints
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found. Please check the API documentation.",
  });
});

app.listen(PORT, () => {
  console.log(`API running on port http://localhost:${PORT}`);
});
