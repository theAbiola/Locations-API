import env from "dotenv";
import locations from "../model/data.js";
env.config();

const masterKey = process.env.LOCATIONS_API_MASTERKEY;

export const getRandomLocation = (req, res) => {
    try {
        if (!Array.isArray(locations) || locations.length === 0) {
            throw new Error("No locations available") //If error occurs, interpreter jumps to catch block and assigns this specified error to error.message
        }

        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        res.json(randomLocation);
    } catch (error) {
        res.status(500).json({ Error: error.message || "Something went wrong" })
    }
}

export const getSpecificLocation = (req, res) => {
    try {
        const locationIdParam = parseInt(req.params.id);

        if (isNaN(locationIdParam)) {
            return res.status(400).json({ Error: "Invalid parameter entered, must be a number!" });
        }

        const foundLocation = locations.find((location) => {
            return location.id === locationIdParam     //EXPLICIT RETURN
        });

        if (!foundLocation) {
            return res.status(404).json({ Error: "Location not found, try a valid location id." });
        }

        res.json(foundLocation);
        console.log(foundLocation);
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong" })
    }
}

export const getFilteredLocations = (req, res) => {
    const queryItems = ["indoor", "outdoor", "indoor/outdoor"]
    try {
        const locationTypeQuery = req.query.type;
        console.log(locationTypeQuery);
        if (locationTypeQuery == "" || locationTypeQuery == null) {
            return res.status(400).json({ Error: "No query parameter entered, try again!" })
        } else if (!queryItems.includes(locationTypeQuery)) {
            res.status(400).json({ Error: "Invalid query parameter entered, enter a valid query paramter" })
        } else {
            const filterLocations = locations.filter((location) => location.locationType == locationTypeQuery); //IMPLICIT RETURN
            res.json(filterLocations);
            console.log(filterLocations);
        }
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong" })
    }

}

export const postNewLocation = (req, res) => {
    try {
        const { name, type, mapURL, affordability, rating } = req.body;
        if (name == null || type == null || mapURL == null || affordability == null || rating == null) {
            return res.status(400).json({ Error: "expected input is empty, try again" });
        } else if (!(affordability <= 5) || !(rating <= 5)) {
            return res.status(400).json({ Error: "enter a valid affordability or rating value" });
        } else {
            const id = locations.length + 1;
            const newLocation = {
                id: id,
                locationName: name,
                locationType: type,
                mapURL: mapURL,
                affordability: affordability,
                rating: rating,
            };
            locations.push(newLocation);
            res.json(newLocation);
            console.log(locations.slice(-1));
        }

    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" })
    }

}

export const putLocation = (req, res) => {
    try {
        const locationId = parseInt(req.params.id);
        const { name, type, mapURL, affordability, rating } = req.body;
        let locationIndex = locations.findIndex((location) => location.id === locationId);

        if (isNaN(locationId)) {
            return res.status(400).json({ Error: "Invalid parameter entered, must be a number!" });
        } else if (name == null || type == null || mapURL == null || affordability == null || rating == null) {
            return res.status(400).json({ Error: "expected input is empty, try again" });
        } else if (!(affordability <= 5) || !(rating <= 5)) {
            return res.status(400).json({ Error: "enter a valid affordability or rating value" });
        } else {
            let exactLocation = locations[locationIndex];

            if (exactLocation == null) {
                return res.status(404).json({ Error: "location not found, try a valid location Id." })
            }
            exactLocation = {
                id: exactLocation.id,
                locationName: name,
                locationType: type,
                mapURL: mapURL,
                affordability: affordability,
                rating: rating,
            }
            res.json(exactLocation);
            console.log(exactLocation);
        }

    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" })
    }

}

export const patchLocation = (req, res) => {
    try {
        const locationId = parseInt(req.params.id);
        if (isNaN(locationId)) {
            return res.status(400).json({ Error: "Invalid parameter entered, must be a number!" })
        }

        const { name, type, mapURL, affordability, rating } = req.body;
        let existingLocation = locations.find((location) => location.id == locationId);

        if (!existingLocation) {
            return res.status(404).json({ Error: "Location not found, try a valid location id." });
        }

        let replacementLocation = {
            id: existingLocation.id,
            locationName: name || existingLocation.locationName, //the 'OR' is for cases where the user doesn't enter a value for the inputs since it's a patch request
            locationType: type || existingLocation.locationType,
            mapURL: mapURL || existingLocation.mapURL,
            affordability: affordability || existingLocation.affordability,
            rating: rating || existingLocation.rating,
        };
        let locationIndex = locations.findIndex((location) => location.id == locationId);

        if (locationIndex == null) {
            return res.status(404).json({ Error: "location not found, try a valid location Id." })
        }

        locations[locationIndex] = replacementLocation;
        res.json(replacementLocation);
        console.log(replacementLocation);
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" })
    }

}

export const deleteSpecificLocation = (req, res) => {
    try {
        const locationId = parseInt(req.params.id);

        if (isNaN(locationId)) {
            return res.status(400).json({ Error: "Invalid parameter entered, id must be a number!" })
        }

        let locationIndex = locations.findIndex((location) => location.id === locationId);
        if (locationIndex > -1) {
            locations.splice(locationIndex, 1);
            res.status(200).json({ Success: "Location deleted successfully!" });
            // res.sendStatus(200);
        } else {
            console.log({
                Error: `location with id: ${locationId} not found. No locations were deleted.`,
            });
            return res.status(404).json({
                Error: `location with id: ${locationId} not found. No locations were deleted.`,
            });

        }
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" });
    }

}

export const deleteAllLocations = (req, res) => {
    try {
        let userKey = req.body.key;
        if (userKey === masterKey) {
            locations.length = 0; //note that this locations variable here is treated as a contant because it's an import so we have to use .length instead of reassigning it an empty array.
            res.status(200).json({ Success: "All locations deleted successfully!" });
        } else {
            res.status(404).json({ Error: "You are not Authorized to perform this action" });
        }
    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" });
    }

};