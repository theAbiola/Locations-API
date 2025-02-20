
const getRandomLocation = (req, res) => {
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

const getSpecificLocation = (req, res) => {
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