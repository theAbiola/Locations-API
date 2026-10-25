import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";

import locationRouter from "./routes/locationRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { healthController } from "./controllers/healthController.js";
import { validateRequestOrigin } from "./middleware/originMiddleware.js";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const getSessionStore = (mongoUrl) =>
  MongoStore.create({
    mongoUrl,
    collectionName: "sessions",
    ttl: DAY_IN_MILLISECONDS / 1000,
    autoRemove: "native",
  });

export const createApp = ({ sessionStore } = {}) => {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined");
  }

  if (!sessionStore && !process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"],
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: "20kb" }));
  app.use(express.json({ limit: "20kb" }));
  app.use(validateRequestOrigin(clientOrigin));
  app.use(
    session({
      name: "locations.sid",
      secret: process.env.SESSION_SECRET,
      store: sessionStore || getSessionStore(process.env.MONGODB_URI),
      resave: false,
      saveUninitialized: false,
      rolling: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: DAY_IN_MILLISECONDS,
        path: "/",
      },
    }),
  );

  app.use("/api/locations/auth", authRouter);
  app.use("/api/locations", locationRouter);

  app.get("/health", healthController);
  app.get("/", (req, res) => {
    return res.status(200).json({
      message: "Welcome to the Locations API",
      name: "Locations API",
      version: "1.0.0",
      status: "available",
      endpoints: {
        health: "/health",
      },
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint not found. Please check the API documentation.",
    });
  });

  app.use((err, req, res, next) => {
    void req;
    void next;
    // eslint-disable-next-line no-console
    console.error(err);

    res.status(500).json({
      success: false,
      message: "An error occurred in the server.",
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  });

  return app;
};
