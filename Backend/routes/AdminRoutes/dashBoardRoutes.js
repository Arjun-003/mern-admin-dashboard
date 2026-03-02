import AdminDash from "../../controllers/AdminController/dashBoardController.js";
import verifyToken from "../../middleware/verifytoken.js";
import express from "express";

const router = express.Router();
router.get("/getAllUser",verifyToken, AdminDash.getAllUsers);
router.get("/dashboard",verifyToken, AdminDash.dashboardData);
router.post("/login", AdminDash.login);

export default router;