import express from "express";
import rateLimit from "express-rate-limit";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import { requireAuthentication } from "../middleware/authMiddleware.js";

const authRouter = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.post("/logout", requireAuthentication, logout);
authRouter.get("/me", requireAuthentication, getCurrentUser);

export default authRouter;
