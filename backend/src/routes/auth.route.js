import express from "express";
import {
  signup,
  login,
  logout,
  //   updateProfile,
  checkAuth,
  confirmRegister,
  forgotPassword,
  resetPassword,
  refreshOTP,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/confirm-register", confirmRegister);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-otp", refreshOTP);
router.get("/check", protectRoute, checkAuth);

export default router;
