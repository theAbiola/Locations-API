import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
    },
    providers: {
      local: { type: Boolean, default: true },
      googleSubject: { type: String, select: false },
    },
  },
  { timestamps: true },
);

userSchema.index(
  { "providers.googleSubject": 1 },
  { unique: true, sparse: true },
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return { id: this.id, email: this.email, role: this.role };
};

const User = mongoose.model("user", userSchema);

export default User;
