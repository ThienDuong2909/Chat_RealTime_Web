import express from "express";

import { createPost } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("create-post", protectRoute, createPost);

export default router;
