import User from "../models/User.js";

const unauthenticatedResponse = (res) =>
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });

export const requireAuthentication = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return unauthenticatedResponse(res);
    }

    const user = await User.findById(req.session.userId);
    if (!user || user.status !== "active") {
      req.session.destroy(() => {});
      return unauthenticatedResponse(res);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access required",
    });
  }

  return next();
};
