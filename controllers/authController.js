import bcrypt from "bcrypt";
import User from "../models/User.js";

const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_NAME = "locations.sid";

const validateCredentials = (email, password) => {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "Enter a valid email address";
  }

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return "Password must be at least 12 characters and at most 72 bytes";
  }

  return null;
};

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });

export const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (role !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Role cannot be assigned during registration",
      });
    }

    const validationError = validateCredentials(email, password);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ email: normalizedEmail, passwordHash });

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    return res.status(201).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists",
      });
    }
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const invalidCredentials = () =>
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    if (typeof email !== "string" || typeof password !== "string") {
      return invalidCredentials();
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");
    if (!user || user.status !== "active") {
      return invalidCredentials();
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return invalidCredentials();
    }

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    return res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    return next(error);
  }
};

export const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.status(200).json({ success: true, message: "Logged out" });
  });
};

export const getCurrentUser = (req, res) =>
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
