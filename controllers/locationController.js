import Location from "../models/Location.js";


export const getLocations = async (req, res) => {

    try {
        const { locationType, affordability, rating } = req.query
        const filters = {}

        if(locationType !== undefined) {
            if(typeof locationType !== "string") {
                return res.status(400).json({
                    Error: "locationType must be a single string"
                })
            }

            filters.locationType = locationType.trim().toLowerCase()
        }



        if(affordability !== undefined) {
            const affordabilityNumber = Number(affordability)
            
            if(!Number.isFinite(affordabilityNumber)) {
                return res.status(400).json({
                    Error: "affordability must be a number"
                })
            }

            filters.affordability = affordabilityNumber
        }


        if(rating !== undefined) {
            const ratingNumber = Number(rating)

            if(!Number.isFinite(ratingNumber)){
                return res.status(400).json({
                    Error: "rating must be a number"
                })
            }

            filters.rating = ratingNumber
        }

        const locations = await Location.find(filters)

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ 
            Error: error.message || "Something went wrong" 
        })
    }
}

export const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.isValidObjectId(id)) {
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
            Error: "Something went wrong" 
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
        
        if (locationName == null || locationType == null || mapURL == null || affordability == null || rating == null) {
            return res.status(400).json({ 
                Error: "expected input is empty, try again" 
            });
        } else if (!(affordability <= 5) || !(rating <= 5)) {
            return res.status(400).json({ 
                Error: "enter a valid affordability or rating value" 
            });
        } else {
            const newLocation = req.body;
            const location = await Location.create(newLocation);
            res.status(201).json(location);
            console.log(location);
        }

    } catch (error) {
        res.status(500).json({ Error: "Something went wrong!" })
    }

}

export const putLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.isValidObjectId(id)) {
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

        if (
            typeof locationName !== "string" || 
            locationType == "string" || 
            mapURL == "string" || 
            affordability == null || 
            rating == null
        ) {
            return res.status(400).json({ 
                Error: "expected input is empty, try again" 
            });
        } 
        
        const affordabilityNumber = Number(affordability)
        const ratingNumber = Number(rating)
        
        if (
            !Number.isFinite(affordabilityNumber) ||
            !Number.isFinite(ratingNumber) ||
            affordabilityNumber < 0 ||
            affordabilityNumber > 5 ||
            ratingNumber < 0 ||
            ratingNumber > 5
        ) {
            return res.status(400).json({ 
                Error: "Affordability and rating must be numbers between 0 and 5"
            });
        } 
        
        const updatedLocation = {
            locationName: locationName.trim(),
            locationType: locationType.trim(),
            mapURL: mapURL.trim(),
            affordability: affordabilityNumber,
            rating: ratingNumber
        }


        const location = await Location.findByIdAndUpdate(
            id, 
            updatedLocation,
             { new: true, runValidators: true }
            );

        if(!location) {
            return res.status(404).json({
                Error: "Location not found"
            })
        }

        res.status(200).json(location);
        console.log(location);

    } catch (error) {
        res.status(500).json({ 
            Error: "Something went wrong!" 
        })
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