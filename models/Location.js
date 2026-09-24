import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        locationName: {
            type: String,
            required: [true, "Enter a location name"],
            trim: true
        },

        locationType: {
            type: String,
            required: [true, "Enter a location type"],
            trim: true,
            lowercase: true,
            enum: {
                values: ["indoor", "outdoor", "indoor/outdoor"],
                message:
                    "{VALUE} is not valid. Use indoor, outdoor, or indoor/outdoor"
            }
        },

        mapURL: {
            type: String,
            required: [true, "Enter a map URL"],
            trim: true
        },

        affordability: {
            type: Number,
            required: [true, "Enter an affordability rating"],
            min: [0, "Affordability cannot be less than 0"],
            max: [5, "Affordability cannot be greater than 5"]
        },

        rating: {
            type: Number,
            required: [true, "Enter a rating"],
            min: [0, "Rating cannot be less than 0"],
            max: [5, "Rating cannot be greater than 5"]
        }
    },
    {
        timestamps: true
    }
);

const Location = mongoose.model("location", locationSchema); //the const `Location` creates a model from the schema.
// The argument "location" is the name of the collection which would be pluralized by mongoose later in mongoDB.
// "locationSchema" is the schema that the model is based on.

export default Location;