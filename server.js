import express from "express";
import env from "dotenv";
import locationRoutes from "./routes/location.routes.js"
import mongoose from "mongoose";


export const app = express();
env.config();
const port = process.env.API_PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Important to parse incoming JSON requests

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected to the MongoDB Database");
  })
  .catch((error) => {
    console.error(`${error}: Connection Failed!`);
  });

app.use("/locations", locationRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Locations API");
});

app.listen(port, () => {
  console.log(`API running on port http://localhost:${port}`);
});

