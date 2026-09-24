import express from "express";
import {
    getLocations,
    getLocationById, 
    postNewLocation,
    putLocation,
    deleteSpecificLocation,
} from "../controllers/locationController.js"

const locationRouter = express.Router();

locationRouter.get("/", getLocations);
locationRouter.get("/:id", getLocationById);
locationRouter.post("/", postNewLocation);
locationRouter.put("/:id", putLocation);
locationRouter.delete("/:id", deleteSpecificLocation);

export default locationRouter;

