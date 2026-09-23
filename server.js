import "dotenv/config";
import express from "express";
import { connectDB } from "./db/db.js";
import locationRouter from "./routes/locationRoutes.js"


export const app = express();

const PORT = process.env.API_PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Important to parse incoming JSON requests

connectDB()

app.use("/locations", locationRouter);


app.get("/", (req, res) => {
  res.send("Welcome to the Locations API"); //refactor later to render an actual static webpage that contains the API documentation.
  //api documentation currently in progress
});


app.listen(PORT, () => {
  console.log(`API running on port http://localhost:${PORT}`);
});

