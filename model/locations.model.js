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