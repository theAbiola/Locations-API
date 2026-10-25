import bcrypt from "bcrypt";
import User from "../models/User.js";

const BCRYPT_ROUNDS = 12;

export const bootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) {
    return null;
  }

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be configured together",
    );
  }

  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters and at most 72 bytes",
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return existingUser;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    return await User.create({ email, passwordHash, role: "admin" });
  } catch (error) {
    if (error?.code === 11000) {
      // Duplicate admin user check
      return User.findOne({ email });
    }
    throw error;
  }
};
