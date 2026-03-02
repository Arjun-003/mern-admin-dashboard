import express from "express";
import ChatData from "../controllers/ChatController.js";
import verifyToken from "../middleware/verifytoken.js";
const router = express.Router();
router.get("/chats",verifyToken, ChatData.getUserChats);// Get all chats for a user
export default router;
