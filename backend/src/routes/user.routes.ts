import { Router } from "express";
import {
  createMessage,
  getMessages,
  messageRead,
  updateMessage,
  deleteMessage,
  createContact,
  getContacts,
  createReaction,
  updateEmail,
  updateProfile,
  sendOtp,
  deleteUser,
  deleteContact,
} from "#controllers/user.controller.js";
import { protectRoute, requireVerified } from "#middlewares/auth.js";
import { uploadSingleImage } from "#utils/imageUploader.js";

const router = Router();
//GET

router.get("/contacts", protectRoute, requireVerified, getContacts);
router.get("/messages/:contactId", protectRoute, requireVerified, getMessages);
//POST
router.post(
  "/message",
  protectRoute,
  requireVerified,
  uploadSingleImage,
  createMessage,
);
router.post("/message-read", protectRoute, requireVerified, messageRead);
router.post("/contact", protectRoute, requireVerified, createContact);
router.post("/reaction", protectRoute, requireVerified, createReaction);
router.post("/send-otp", protectRoute, requireVerified, sendOtp);
//PUT
router.put(
  "/profile",
  protectRoute,
  requireVerified,
  uploadSingleImage,
  updateProfile,
);
router.put("/message/:messageId", protectRoute, requireVerified, updateMessage);
router.put("/email", protectRoute, requireVerified, updateEmail);
//DELETE
router.delete("/delete", protectRoute, requireVerified, deleteUser);
router.delete(
  "/contact/:contactId",
  protectRoute,
  requireVerified,
  deleteContact,
);
router.delete(
  "/message/:messageId",
  protectRoute,
  requireVerified,
  deleteMessage,
);
export default router;
