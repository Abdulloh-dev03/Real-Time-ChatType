import type { Request, Response, NextFunction } from "express";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";
import User from "#models/user.model.js";
import logger from "#config/logger.js";
import type { IUser } from "#types/user.js";
import { AUTH_STATE } from "#lib/constants.js";

/**
 * Middleware to protect routes by verifying the JWT token in cookies.
 * Attaches the authenticated user to req.user when JWT is valid.
 * Does NOT check for verification status.
 */
export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = cookies.get(req, "token");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
        code: AUTH_STATE.NOT_AUTHENTICATED,
      });
    }

    let decoded: { _id: string; email: string };
    try {
      decoded = jwttoken.verify(token);
    } catch (error) {
      logger.warn("JWT verification failed in protectRoute", { error });
      return res.status(401).json({
        message: "Unauthorized: Invalid token",
        code: AUTH_STATE.NOT_AUTHENTICATED,
      });
    }

    const user = await User.findById(decoded._id).lean<IUser>();

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        code: AUTH_STATE.NOT_AUTHENTICATED,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication error in protectRoute", { error });
    return res.status(500).json({
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Middleware to ensure the user is verified.
 * Must be used AFTER protectRoute.
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as IUser | undefined;

  if (!user) {
    return res.status(401).json({
      message: "Authentication required",
      code: AUTH_STATE.NOT_AUTHENTICATED,
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      message: "Account not verified",
      code: "NOT_VERIFIED",
      authState: AUTH_STATE.AUTHENTICATED_BUT_NOT_VERIFIED,
    });
  }

  next();
};
