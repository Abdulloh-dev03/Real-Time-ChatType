// src/controllers/google.controller.ts
import type { Request, Response } from "express";
import type { IUser } from "#types/user.js";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Passport guarantees req.user if auth succeeds
    if (!req.user) {
      res.status(401).json({ message: "Google authentication failed" });
      return;
    }

    const user = req.user as IUser;

    // Hard safety check (never trust runtime blindly)
    if (!user._id || !user.email) {
      res.status(400).json({ message: "Invalid user data from Google" });
      return;
    }

    // ✅ CONSISTENT JWT PAYLOAD
    const payload = {
      _id: user._id,
      email: user.email,
    };

    const token = jwttoken.sign(payload);

    // ✅ HTTP-only secure cookie
    cookies.set(res, "token", token);

    const FRONTEND_SERVER = process.env.CLIENT_WEB;
    if (!FRONTEND_SERVER) {
      res.status(500).json({ message: "Frontend URL not configured" });
      return;
    }

    // ✅ NO TOKEN IN URL
    res.redirect(`${FRONTEND_SERVER}/oauth/callback`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.status(500).json({ message: "OAuth login failed" });
  }
};
