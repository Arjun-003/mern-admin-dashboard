import commentsController from "../controllers/commentsController.js";
import express from "express";
const router = express.Router();
// Route to create a new comment
router.post("/comment", commentsController.createComment); 
// Route to get comments for a specific product 
router.get("/comment/:productid", commentsController.getCommentsByProduct);
export default router;