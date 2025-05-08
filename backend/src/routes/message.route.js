import express from "express";
import {
  getListUserChatted,
  getMessage,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get-list-user-chat", protectRoute, getListUserChatted);
router.get("/get-messages/:id", protectRoute, getMessage);
router.post("/send-message/:id", protectRoute, sendMessage);

export default router;
