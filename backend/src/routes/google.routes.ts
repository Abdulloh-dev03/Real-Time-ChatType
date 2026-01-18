// src/routes/oauth.routes.ts
import { googleCallback } from "#controllers/google.controller.js";
import { Router } from "express";
import passport from "passport";

const router = Router();

const FRONTEND_URL = process.env.CLIENT_WEB;

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login`,
    session: false,
  }),
  googleCallback
);

export default router;
