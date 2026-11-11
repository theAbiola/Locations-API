import mongoose from "mongoose";
import Location from "../models/Location.js";

const normalizeImageURLs = (imageURLs) => {
  if (!Array.isArray(imageURLs)) {
    return { error: "imageURLs must be an array of up to 4 URLs" };
  }

  if (imageURLs.length > 4) {
    return { error: "imageURLs cannot contain more than 4 URLs" };
  }

  const normalizedImageURLs = imageURLs.map((imageURL) =>
    typeof imageURL === "string" ? imageURL.trim() : imageURL,
  );

  if (
    normalizedImageURLs.some((imageURL) => {
      if (typeof imageURL !== "string" || imageURL === "") {
        return true;
      }

      try {
        const url = new URL(imageURL);
        return url.protocol !== "http:" && url.protocol !== "https:";
      } catch {
        return true;
      }
    })
  ) {
    return {
      error: "imageURLs must contain only valid HTTP or HTTPS URLs",
    };
  }

  return { value: normalizedImageURLs };
};

export const getLocations = async (req, res) => {
  try {
    const { locationType, affordability, rating } = req.query;
    const filters = {};

    if (locationType !== undefined) {
      if (typeof locationType !== "string" || locationType.trim() === "") {
        return res.status(400).json({
          Error: "locationType must be a non-empty string",
        });
      }

      const normalizedLocationType = locationType.trim().toLowerCase();

      const allowedLocationTypes = ["indoor", "outdoor", "indoor/outdoor"];

      if (!allowedLocationTypes.includes(normalizedLocationType)) {
        return res.status(400).json({
          Error: "locationType must be indoor, outdoor, or indoor/outdoor",
        });
      }
      filters.locationType = normalizedLocationType;
    }

    if (affordability !== undefined) {
      if (typeof affordability !== "string" || affordability.trim() === "") {
        return res.status(400).json({
          Error: "affordability must be a single number",
        });
      }

      const affordabilityNumber = Number(affordability);

      if (
        !Number.isFinite(affordabilityNumber) ||
        affordabilityNumber < 0 ||
        affordabilityNumber > 5
      ) {
        return res.status(400).json({
          Error: "affordability must be a number between 0 and 5",
        });
      }

      filters.affordability = affordabilityNumber;
    }

    if (rating !== undefined) {
      if (typeof rating !== "string" || rating.trim() === "") {
        return res.status(400).json({
          Error: "rating must be a single number",
        });
      }

      const ratingNumber = Number(rating);

      if (
        !Number.isFinite(ratingNumber) ||
        ratingNumber < 0 ||
        ratingNumber > 5
      ) {
        return res.status(400).json({
          Error: "rating must be a number between 0 and 5",
        });
      }

      filters.rating = ratingNumber;
    }

    const locations = await Location.find(filters);

    res.status(200).json(locations);
  } catch {
    res.status(500).json({
      Error: "Internal Server Error!",
    });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location id",
      });
    }

    const foundLocation = await Location.findById(id);

    if (!foundLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found, try a valid location id.",
      });
    }

    res.status(200).json(foundLocation);
  } catch {
    res.status(500).json({
      Error: "Internal Server Error!",
    });
  }
};

export const postNewLocation = async (req, res) => {
  try {
    const {
      locationName,
      locationType,
      mapURL,
      affordability,
      rating,
      imageURLs,
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
        Error: "Please provide valid values for all required fields",
      });
    }

    // Reject empty or whitespace-only strings
    if (!locationName.trim() || !locationType.trim() || !mapURL.trim()) {
      return res.status(400).json({
        Error: "String fields cannot be empty",
      });
    }

    const normalizedImageURLs =
      imageURLs === undefined ? { value: [] } : normalizeImageURLs(imageURLs);

    if (normalizedImageURLs.error) {
      return res.status(400).json({
        Error: normalizedImageURLs.error,
      });
    }

    const newLocation = {
      locationName: locationName.trim(),
      locationType: locationType.trim().toLowerCase(),
      mapURL: mapURL.trim(),
      affordability,
      rating,
      imageURLs: normalizedImageURLs.value,
    };

    const location = await Location.create(newLocation);

    return res.status(201).json(location);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        Error: error.message,
      });
    }

    return res.status(500).json({
      Error: "Internal Server Error!",
    });
  }
};

export const patchLocation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        Error: "Invalid location id",
      });
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        Error: "At least one location field is required",
      });
    }

    const supportedFields = [
      "locationName",
      "locationType",
      "mapURL",
      "affordability",
      "rating",
      "imageURLs",
    ];
    const fieldsToUpdate = supportedFields.filter((field) =>
      Object.hasOwn(req.body, field),
    );

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        Error: "At least one location field is required",
      });
    }

    const updatedLocation = {};
    for (const field of fieldsToUpdate) {
      const value = req.body[field];

      if (["locationName", "locationType", "mapURL"].includes(field)) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({
            Error: "String fields cannot be empty",
          });
        }

        updatedLocation[field] =
          field === "locationType" ? value.trim().toLowerCase() : value.trim();
        continue;
      }

      if (["affordability", "rating"].includes(field)) {
        if (!Number.isFinite(value) || value < 0 || value > 5) {
          return res.status(400).json({
            Error: "Affordability and rating must be numbers between 0 and 5",
          });
        }

        updatedLocation[field] = value;
        continue;
      }

      const normalizedImageURLs = normalizeImageURLs(value);
      if (normalizedImageURLs.error) {
        return res.status(400).json({
          Error: normalizedImageURLs.error,
        });
      }

      const location = await Location.findById(id).select("imageURLs");
      if (!location) {
        return res.status(404).json({
          Error: "Location not found",
        });
      }

      const existingImageURLs = location.imageURLs || [];
      const imageURLSet = new Set(existingImageURLs);
      const appendedImageURLs = normalizedImageURLs.value.filter((imageURL) => {
        if (imageURLSet.has(imageURL)) {
          return false;
        }

        imageURLSet.add(imageURL);
        return true;
      });
      const mergedImageURLs = [...existingImageURLs, ...appendedImageURLs];

      if (mergedImageURLs.length > 4) {
        return res.status(400).json({
          Error: "A location cannot have more than 4 image URLs",
        });
      }

      updatedLocation.imageURLs = mergedImageURLs;
    }

    const location = await Location.findByIdAndUpdate(id, updatedLocation, {
      new: true,
      runValidators: true,
    });

    if (!location) {
      return res.status(404).json({
        Error: "Location not found",
      });
    }

    res.status(200).json(location);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        Error: error.message,
      });
    }

    return res.status(500).json({
      Error: "Internal Server Error!",
    });
  }
};

export const deleteSpecificLocation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        Error: "Invalid location id",
      });
    }

    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({
        Error: "Location not found, try a valid location id",
      });
    }

    res.status(200).json({ Success: "Location deleted successfully!" });
  } catch {
    return res.status(500).json({
      Error: "Internal Server Error!",
    });
  }
};
