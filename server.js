import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import locationRoutes from "./routes/location.routes.js"
import mongoose from "mongoose";



export const app = express();
env.config();
const port = process.env.API_PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Important to parse incoming JSON requests

app.use("/locations", locationRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Locations API");
});

app.listen(port, () => {
  console.log(`API running on port http://localhost:${port}`);
});

