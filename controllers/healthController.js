import mongoose from "mongoose";

export const healthController = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "unavailable",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }

    // if promise resolves, api can communicate with MongoDB. Promise rejects, JS jumps to the catch block.
    await mongoose.connection.db.admin().ping();

    return res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: "unavailable",
      database: "unreachable",
      timestamp: new Date().toISOString(),
    });
  }
};
