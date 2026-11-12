import express from "express";
import {
  getLocations,
  getLocationById,
  postNewLocation,
  patchLocation,
  deleteSpecificLocation,
} from "../controllers/locationController.js";
import {
  requireAdmin,
  requireAuthentication,
} from "../middleware/authMiddleware.js";

const locationRouter = express.Router();

locationRouter.use(requireAuthentication);

locationRouter.get("/", getLocations);
locationRouter.get("/:id", getLocationById);
locationRouter.post("/", requireAdmin, postNewLocation);
locationRouter.patch("/:id", requireAdmin, patchLocation);
locationRouter.delete("/:id", requireAdmin, deleteSpecificLocation);

export default locationRouter;
