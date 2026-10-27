import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import slowDown from "express-slow-down";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import { requireAuthentication } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

const throttle = slowDown({
  delayMs: (hits) => (hits - 2) * 1000,
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) =>
    ipKeyGenerator(req.ip || req.socket?.remoteAddress || "unknown-client", 56),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again after some time.",
  },
});

authRouter.post("/register", throttle, authLimiter, register);
authRouter.post("/login", throttle, authLimiter, login);
authRouter.post("/logout", requireAuthentication, logout);
authRouter.get("/me", requireAuthentication, getCurrentUser);

export default authRouter;
