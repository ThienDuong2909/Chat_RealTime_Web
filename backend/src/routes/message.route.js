import express from "express";
import {
  getListUserChat,
  getMessage,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get-list-user-chat", protectRoute, getListUserChat);
router.get("/get-messages/:id", protectRoute, getMessage);
router.post("/send-message/:id", protectRoute, sendMessage);

export default router;
