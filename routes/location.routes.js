import express from "express";
import {
    getRandomLocation,
    getSpecificLocation,
    getFilteredLocations,
    postNewLocation,
    putLocation,
    patchLocation,
    deleteSpecificLocation,
    deleteAllLocations
} from "../controllers/location.controller.js"

const router = express.Router();

router.get("/random", getRandomLocation);
router.get("/:id", getSpecificLocation);
router.get("/chunk/filter", getFilteredLocations);
router.post("/new", postNewLocation);
router.put("/:id", putLocation);
router.patch("/:id", patchLocation);
router.delete("/:id", deleteSpecificLocation);
router.delete("/del/all", deleteAllLocations)

export default router;

