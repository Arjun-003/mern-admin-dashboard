import express from "express";
import verifyToken from "../../middleware/verifytoken.js";
import ordersController from '../../controllers/AppController/ordersController.js';

const router = express.Router();

router.post("/createOrder", verifyToken , ordersController.createOrder)
router.post("/create-payment-intent", verifyToken , ordersController.orderCreateIntent)

export default router;