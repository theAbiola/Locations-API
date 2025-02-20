
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