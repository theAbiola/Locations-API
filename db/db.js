import mongoose from "mongoose";

export const connectDB = async () => {
  const URI = process.env.MONGODB_URI;

  try {
    if (!URI) {
      throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(URI);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected successfully!");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error: ", err.message);
    process.exit(1);
  }
};
