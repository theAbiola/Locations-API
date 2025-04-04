import mongoose from "mongoose";

const locationSchema = mongoose.Schema(
    {
        locationName: {
            type: String,
            required: [true, "Enter location name"]
        },
        locationType: {
            type: String,
            required: true,
            default: "No location type entered"
        },
        mapURL: {
            type: String,
            required: true,
            default: "paste map url here from google maps"
        },
        affordability: {
            type: Number,
            required: false,
        },
        rating: {
            type: Number,
            required: true,
            default: 0
        },
    },
    {
        timestamps: true
    },
)

const Location = mongoose.model("location", locationSchema); //the const `Location` creates a model from the schema.
// The argument "location" is the name of the collection which would be pluralized by mongoose later in mongoDB.
// "locationSchema" is the schema that the model is based on.

export default Location;