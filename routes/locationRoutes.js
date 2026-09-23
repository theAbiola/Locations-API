import express from "express";
import {
    getAllLocations,
    getSpecificLocation,
    getFilteredLocations,
    postNewLocation,
    putLocation,
    deleteSpecificLocation,
} from "../controllers/locationController.js"

const locationRouter = express.Router();

locationRouter.get("/all", getAllLocations);
locationRouter.get("/:id", getSpecificLocation);
locationRouter.get("/chunk/filter", getFilteredLocations);
locationRouter.post("/new", postNewLocation);
locationRouter.put("/:id", putLocation);
locationRouter.delete("/:id", deleteSpecificLocation);

export default locationRouter;

