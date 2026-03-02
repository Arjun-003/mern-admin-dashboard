import userController from "../../controllers/AdminController/userPageController.js";
import verifyToken from "../../middleware/verifytoken.js";
import userAvatarUpload from "../../middleware/userAvatarUpload.js";
import express from 'express';

const router = express.Router();
// Admin Profile Update
router.put(
  '/adminProfileUpdate',
  verifyToken,
  userAvatarUpload.single("profile_image"),
  userController.AdminProfileUpdate // <-- new controller I gave you
);
// User Status Change
router.put('/userStatusChange', userController.updateUserStatus);
router.get('/userDetail/:userId', userController.userDetail);

export default router;