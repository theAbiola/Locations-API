import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import locationRoutes from "./routes/location.routes.js"

export const app = express();
env.config();
const port = process.env.API_PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //Important to parse incoming JSON requests

app.use("/locations", locationRoutes);

app.listen(port, () => {
  console.log(`API running on port http://localhost:${port}`);
});

