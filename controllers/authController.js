import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  credentialsSchema,
  getValidationMessage,
} from "../validation/authValidation.js";

const BCRYPT_ROUNDS = 12;
const COOKIE_NAME = "locations.sid";

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
    const { email, password, role } = req.body ?? {};

    if (role !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Role cannot be assigned during registration",
      });
    }

    const credentials = credentialsSchema.safeParse({ email, password });
    if (!credentials.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(credentials.error),
      });
    }

    const { email: normalizedEmail, password: normalizedPassword } =
      credentials.data;
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, BCRYPT_ROUNDS);
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
    const credentials = credentialsSchema.safeParse(req.body ?? {});
    const invalidCredentials = () =>
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    if (!credentials.success) {
      return invalidCredentials();
    }

    const { email, password } = credentials.data;
    const user = await User.findOne({
      email,
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
