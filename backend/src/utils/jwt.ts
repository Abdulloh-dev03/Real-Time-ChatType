import logger from "#config/logger.js";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = process.env.JWT_SECRET;

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const jwttoken = {
  sign: (payload: object) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
      });
    } catch (error) {
      logger.error("Failed to sign token", error);
      throw new Error("Failed to sign token");
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET) as {
        _id: string;
        email: string;
      };
    } catch (error) {
      logger.error("Failed to verify token", error);
      throw new Error("Failed to authenticate token");
    }
  },
};
