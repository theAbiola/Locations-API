import express from "express";
import {
    getAllLocations,
    getSpecificLocation,
    getFilteredLocations,
    postNewLocation,
    putLocation,
    deleteSpecificLocation,
} from "../controllers/location.controller.js"

const router = express.Router();

router.get("/all", getAllLocations);
router.get("/:id", getSpecificLocation);
router.get("/chunk/filter", getFilteredLocations);
router.post("/new", postNewLocation);
router.put("/:id", putLocation);
router.delete("/:id", deleteSpecificLocation);

export default router;

