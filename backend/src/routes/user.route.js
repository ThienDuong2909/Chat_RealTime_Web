import express from "express";

import {
  updateAvatar,
  updateFullname,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/update-fullname", protectRoute, updateFullname);
router.post("/update-avatar", protectRoute, updateAvatar);

export default router;
