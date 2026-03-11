import usersdata from "../../controllers/AppController/userController.js";
import express from "express";
import verifyToken from "../../middleware/verifytoken.js";
import userAvatarUpload from "../../middleware/userAvatarUpload.js";
const router = express.Router();

router.get('/getAllUsers', usersdata.getAllUsers);
router.get('/singleUser/:id',usersdata.singleUser);
router.post('/sign_up', usersdata.sign_up); // for creating new users
router.post('/login', usersdata.login);// for login as existing users
router.post('/logOut',verifyToken, usersdata.logout)
router.get('/profile', verifyToken, usersdata.profile); // for getting user profile
router.post('/forgot-password', usersdata.forgotPassword); // for forgot password
router.post('/reset-password', usersdata.resetPassword); // for reset password
router.post("/verify-otp", usersdata.verifyOtp);
router.post("/resend-otp", usersdata.resendOtp);
router.put(
  '/profile/update',
  verifyToken,
  userAvatarUpload.single("profile_image"),
  usersdata.updateProfile // <-- new controller I gave you
);

export default router;

