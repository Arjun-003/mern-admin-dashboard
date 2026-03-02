import LikeObject from "../controllers/likeProduct.js";
import express from "express";
import verifyToken  from "../middleware/verifytoken.js";
const router = express.Router();

router.post("/like/:productId",verifyToken, LikeObject.likeProduct);
router.delete("/unlike/:productId", verifyToken, LikeObject.unlikeProduct);

export default router;