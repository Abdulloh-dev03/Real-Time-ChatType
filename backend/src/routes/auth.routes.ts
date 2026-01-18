import { Router } from "express";
import {
  verify,
  signup,
  signin,
  signout,
  checkAuth,
} from "#controllers/auth.controller.js";
import { protectRoute } from "#middlewares/auth.js";

const router = Router();
router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/verify", verify);
router.post("/sign-out", signout);
router.get("/check", protectRoute, checkAuth);

export default router;
