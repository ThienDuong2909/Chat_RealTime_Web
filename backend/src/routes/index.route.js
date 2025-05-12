import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import messageRoutes from "./message.route.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route direction
router.use("/auth", authRoutes);
router.use("/user", protectRoute, userRoutes);
router.use("/message", protectRoute, messageRoutes);

export default router;
