import mongoose from "mongoose";
import Location from "../models/Location.js";


export const getLocations = async (req, res) => {

    try {
        const { locationType, affordability, rating } = req.query
        const filters = {}

        if (locationType !== undefined) {
            if (typeof locationType !== "string" || locationType.trim() === "") {
                return res.status(400).json({
                    Error: "locationType must be a non-empty string"
                })
            }

            const normalizedLocationType = locationType.trim().toLowerCase()

            const allowedLocationTypes = [
                "indoor",
                "outdoor",
                "indoor/outdoor"
            ]

            if (!allowedLocationTypes.includes(normalizedLocationType)) {
                return res.status(400).json({
                    Error: "locationType must be indoor, outdoor, or indoor/outdoor"
                })
            }
            filters.locationType = normalizedLocationType
        }



        if (affordability !== undefined) {
            if (typeof affordability !== "string" || affordability.trim() === "") {
                return res.status(400).json({
                    Error: "affordability must be a single number"
                })
            }

            const affordabilityNumber = Number(affordability)

            if (!Number.isFinite(affordabilityNumber) || affordabilityNumber < 0 || affordabilityNumber > 5) {
                return res.status(400).json({
                    Error: "affordability must be a number between 0 and 5"
                })
            }

            filters.affordability = affordabilityNumber
        }


        if (rating !== undefined) {
            if (typeof rating !== "string" || rating.trim() === "") {
                return res.status(400).json({
                    Error: "rating must be a single number"
                })
            }

            const ratingNumber = Number(rating)

            if (!Number.isFinite(ratingNumber) || ratingNumber < 0 || ratingNumber > 5) {
                return res.status(400).json({
                    Error: "rating must be a number between 0 and 5"
                })
            }

            filters.rating = ratingNumber
        }

        const locations = await Location.find(filters)

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({
            Error: "Internal Server Error!"
        })
    }
}

export const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                Error: "Invalid location id"
            })
        }

        const foundLocation = await Location.findById(id);

        if (!foundLocation) {
            return res.status(404).json({
                Error: "Location not found, try a valid location id."
            });
        }

        res.status(200).json(foundLocation);
    } catch (error) {
        res.status(500).json({
            Error: "Internal Server Error!"
        })
    }
}


export const postNewLocation = async (req, res) => {
    try {
        const {
            locationName,
            locationType,
            mapURL,
            affordability,
            rating
        } = req.body;

        // Validate field types
        if (
            typeof locationName !== "string" ||
            typeof locationType !== "string" ||
            typeof mapURL !== "string" ||
            !Number.isFinite(affordability) ||
            !Number.isFinite(rating)
        ) {
            return res.status(400).json({
                Error: "Please provide valid values for all required fields"
            });
        }


        // Reject empty or whitespace-only strings
        if (
            !locationName.trim() ||
            !locationType.trim() ||
            !mapURL.trim()
        ) {
            return res.status(400).json({
                Error: "String fields cannot be empty"
            });
        }


        const newLocation = {
            locationName: locationName.trim(),
            locationType: locationType.trim().toLowerCase(),
            mapURL: mapURL.trim(),
            affordability,
            rating
        };

        const location = await Location.create(newLocation);

        return res.status(201).json(location);

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                Error: error.message
            })
        }

        return res.status(500).json({
            Error: "Internal Server Error!"
        })
    }

}

export const putLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                Error: "Invalid location id"
            })
        }

        const {
            locationName,
            locationType,
            mapURL,
            affordability,
            rating
        } = req.body;

        // First: verify the data types
        if (
            typeof locationName !== "string" ||
            typeof locationType !== "string" ||
            typeof mapURL !== "string" ||
            affordability == null ||
            rating == null
        ) {
            return res.status(400).json({
                Error: "expected input is empty, try again"
            });
        }

        // Second: safely check for empty or whitespace-only strings
        if (
            !locationName.trim() ||
            !locationType.trim() ||
            !mapURL.trim()
        ) {
            return res.status(400).json({
                Error: "String fields cannot be empty"
            });
        }

        // Third: validate the numeric fields
        if (
            !Number.isFinite(affordability) ||
            !Number.isFinite(rating) ||
            affordability < 0 ||
            affordability > 5 ||
            rating < 0 ||
            rating > 5
        ) {
            return res.status(400).json({
                Error: "Affordability and rating must be numbers between 0 and 5"
            });
        }

        // Finally: construct the validated update
        const updatedLocation = {
            locationName: locationName.trim(),
            locationType: locationType.trim(),
            mapURL: mapURL.trim(),
            affordability: affordability,
            rating: rating
        }

        const location = await Location.findByIdAndUpdate(
            id,
            updatedLocation,
            { new: true, runValidators: true }
        );

        if (!location) {
            return res.status(404).json({
                Error: "Location not found"
            })
        }

        res.status(200).json(location);
        console.log(location);

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                Error: error.message
            })
        }

        return res.status(500).json({
            Error: "Internal Server Error!"
        })
    }

}


export const deleteSpecificLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                Error: "Invalid location id"
            })
        }

        const location = await Location.findByIdAndDelete(id);

        if (!location) {
            return res.status(404).json({
                Error: "Location not found, try a valid location id"
            })
        }

        res.status(200).json({ Success: "Location deleted successfully!" });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error!"
        });
    }

}