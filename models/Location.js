import mongoose from "mongoose";

const isImageURL = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const locationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: [true, "Enter a location name"],
      trim: true,
    },

    locationType: {
      type: String,
      required: [true, "Enter a location type"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["indoor", "outdoor", "indoor/outdoor"],
        message: "{VALUE} is not valid. Use indoor, outdoor, or indoor/outdoor",
      },
    },

    mapURL: {
      type: String,
      required: [true, "Enter a map URL"],
      trim: true,
    },

    affordability: {
      type: Number,
      required: [true, "Enter an affordability rating"],
      min: [0, "Affordability cannot be less than 0"],
      max: [5, "Affordability cannot be greater than 5"],
    },

    rating: {
      type: Number,
      required: [true, "Enter a rating"],
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"],
    },

    imageURLs: {
      type: [
        {
          type: String,
          trim: true,
          validate: {
            validator: isImageURL,
            message: "{VALUE} is not a valid image URL",
          },
        },
      ],
      default: [],
      validate: {
        validator: (imageURLs) => imageURLs.length <= 4,
        message: "A location cannot have more than 4 image URLs",
      },
    },
  },
  {
    timestamps: true,
  },
);

const Location = mongoose.model("location", locationSchema);

export default Location;
