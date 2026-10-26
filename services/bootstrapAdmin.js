import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  credentialsSchema,
  getValidationMessage,
} from "../validation/authValidation.js";

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

  const credentials = credentialsSchema.safeParse({ email, password });
  if (!credentials.success) {
    throw new Error(
      `Invalid administrator credentials: ${getValidationMessage(credentials.error)}`,
    );
  }

  const { email: normalizedEmail, password: normalizedPassword } =
    credentials.data;
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return existingUser;
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, BCRYPT_ROUNDS);
  try {
    return await User.create({
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });
  } catch (error) {
    if (error?.code === 11000) {
      // Duplicate admin user check
      return User.findOne({ email: normalizedEmail });
    }
    throw error;
  }
};
