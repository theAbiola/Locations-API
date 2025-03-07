import env from "dotenv";
import Location from "../model/location.model.js";
env.config();

export const getAllLocations = async (req, res) => {
    try {
        const allLocations = await Location.find({})
        res.json(allLocations);
    } catch (error) {
        res.status(500).json({ Error: error.message || "Something went wrong" })
    }
}

export const getSpecificLocation = async (req, res) => {
    try {
        const locationIdParam = req.params.id;

        const foundLocation = await Location.findById(locationIdParam);

        if (!foundLocation) {
            return res.status(404).json({ Error: "Location not found, try a valid location id." });
        }

        res.json(foundLocation);
        console.log(foundLocation);
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong" })
    }
}

export const getFilteredLocations = async (req, res) => {
    const queryItems = ["indoor", "outdoor", "indoor/outdoor"]
    try {
        const locationTypeQuery = req.query.locationType;
        console.log(locationTypeQuery);
        if (locationTypeQuery == "" || locationTypeQuery == null) {
            return res.status(400).json({ Error: "No query parameter entered, try again!" })
        } else if (!queryItems.includes(locationTypeQuery)) {
            res.status(400).json({ Error: "Invalid query parameter entered, enter a valid query paramter" })
        } else {
            const filteredLocations = await Location.findOne({ locationType: locationTypeQuery });
            res.json(filteredLocations);
            console.log(filteredLocations);
        }
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong" })
    }

}

export const postNewLocation = async (req, res) => {
    try {
        const { locationName, locationType, mapURL, affordability, rating } = req.body;
        if (locationName == null || locationType == null || mapURL == null || affordability == null || rating == null) {
            return res.status(400).json({ Error: "expected input is empty, try again" });
        } else if (!(affordability <= 5) || !(rating <= 5)) {
            return res.status(400).json({ Error: "enter a valid affordability or rating value" });
        } else {
            const newLocation = req.body;
            const location = await Location.create(newLocation);
            res.json(location);
            console.log(location);
        }

    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" })
    }

}

export const putLocation = async (req, res) => {
    try {
        const locationId = req.params.id;
        const { locationName, locationType, mapURL, affordability, rating } = req.body;

        if (locationName == null || locationType == null || mapURL == null || affordability == null || rating == null) {
            return res.status(400).json({ Error: "expected input is empty, try again" });
        } else if (!(affordability <= 5) || !(rating <= 5)) {
            return res.status(400).json({ Error: "enter a valid affordability or rating value" });
        } else {
            const updatedLocation = req.body
            let location = await Location.findByIdAndUpdate(locationId, updatedLocation, { new: true });
            res.json(location);
            console.log(location);
        }

    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" })
    }

}


export const deleteSpecificLocation = async (req, res) => {
    try {
        const locationId = req.params.id;

        const location = await Location.findByIdAndDelete(locationId);
        if (!location) {
            return res.status(404).json({ Error: "location not found, try a valid location id" })
        }

        res.status(200).json({ Success: "Location deleted successfully!" });

    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" });
    }

}