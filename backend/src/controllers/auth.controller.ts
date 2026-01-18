import logger from "#config/logger.js";
import {
  createUser,
  findByUsername,
  findUserByEmail,
  findUserByIdentifier,
  verifyUser,
} from "#services/auth.service.js";
import { sendLoginOtp, verifyLoginOtp } from "#services/otp.service.js";
import { cookies } from "#utils/cookies.js";
import { jwttoken } from "#utils/jwt.js";
import {
  loginSchema,
  signInSchema,
  verifyOtpSchema,
} from "#validations/auth.validation.js";
import type { NextFunction, Request, Response } from "express";
import type { IUser } from "#types/user.js";
import { AUTH_STATE } from "#lib/constants.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { email, username } = parsed.data;
    const normalizedUsername = username.startsWith("#")
      ? username
      : `#${username}`;

    const existingUser = await findUserByEmail(email);

    // User exists and verified: block signup
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // User exists but not verified: resend OTP and allow verification
    if (existingUser && !existingUser.isVerified) {
      await sendLoginOtp(existingUser.email);
      return res.status(200).json({
        message: "Account exists but not verified. OTP resent.",
      });
    }

    // No user yet: ensure username is free, then create user + send OTP
    const usernameTaken = await findByUsername(normalizedUsername);
    if (usernameTaken) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const newUser = await createUser(email, normalizedUsername);
    await sendLoginOtp(newUser.email);

    return res.status(201).json({
      message: "User created successfully, code sent to your email",
    });
  } catch (error) {
    logger.error("Signup error", { error });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { identifier } = parsed.data;
    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!user.isVerified) {
      await sendLoginOtp(user.email);
      return res.status(403).json({
        message: "Account not verified. OTP resent.",
        email: user.email,
        code: "NOT_VERIFIED",
      });
    }

    const payload = {
      _id: user._id,
      email: user.email,
    };
    const token = jwttoken.sign(payload);
    cookies.set(res, "token", token);

    const safeUserData: Pick<
      IUser,
      | "_id"
      | "email"
      | "username"
      | "firstName"
      | "lastName"
      | "profilePic"
      | "bio"
      | "isVerified"
    > = {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic ?? undefined,
      bio: user.bio ?? undefined,
      isVerified: user.isVerified,
    };

    return res.status(200).json({
      message: "Signed in successfully",
      user: safeUserData,
    });
  } catch (error) {
    logger.error("Signin error", { error });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid OTP input" });
    }

    const { email, otp } = parsed.data;

    const isValid = await verifyLoginOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    const user = await verifyUser(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const payload = {
      _id: user._id,
      email: user.email,
    };
    const token = jwttoken.sign(payload);
    cookies.set(res, "token", token);

    const safeUserData: Pick<
      IUser,
      | "_id"
      | "email"
      | "username"
      | "firstName"
      | "lastName"
      | "profilePic"
      | "bio"
      | "isVerified"
    > = {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic ?? undefined,
      bio: user.bio ?? undefined,
      isVerified: user.isVerified,
    };

    return res.status(200).json({
      message: "Email verified",
      user: safeUserData,
    });
  } catch (error) {
    logger.error("Verify error", { error });
    return res.status(500).json({ message: "Verification failed" });
  }
};

export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = cookies.get(req, "token");

    if (!token) {
      logger.info("Sign-out attempted without token");
    } else {
      logger.info("User signed out");
    }

    cookies.clear(res, "token");

    return res.status(200).json({ message: "User signed out" });
  } catch (error) {
    logger.error("Signout error", { error });
    next(error);
  }
};

export const checkAuth = (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user) {
      return res.status(401).json({
        message: "Not authenticated",
        code: AUTH_STATE.NOT_AUTHENTICATED,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified",
        code: "NOT_VERIFIED",
        authState: AUTH_STATE.AUTHENTICATED_BUT_NOT_VERIFIED,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          isVerified: false,
        },
      });
    }

    return res.status(200).json({
      message: "Authenticated",
      authState: AUTH_STATE.FULLY_AUTHENTICATED,
      user,
    });
  } catch (error) {
    logger.error("CheckAuth error", { error });
    return res.status(500).json({ message: "Internal server error" });
  }
};
