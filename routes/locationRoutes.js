import express from "express";

const router = express.Router();

router.get("/random", getRandomLocation);
router.get("/:id", getSpecificLocation);


