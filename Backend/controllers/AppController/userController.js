import users from "../../models/users.js";
import fs from "fs";
import bcrypt from "bcrypt"
import userSchema from "../../Validations/users_validation.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redisClient from "../../config/redisClient.js";
import crypto from "crypto";
import { sendOTP } from "../../utils/twilio.js";
import { sendMail } from "../../utils/mailer.js";
import path from "path";
dotenv.config();
// Created a Object to hold all user-related controller functions
const usersdata = {
getAllUsers: async (req, res) => {
  try {
    const allUsers = await users.findAll();
    res.status(200).json({ allUsers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all users data" });
  }
},
    singleUser: async (req, res) => {
        const { id } = req.params;
        try {
            const singleUser = await users.findByPk(id);
            res.status(200).json({ singleUser })
        } catch (error) {
            res.status(500).json({ error: 'Failed to Fetch User', error })
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await users.findByPk(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            const { name, email, mobile_Number, removeImage } = req.body;
            let imagePath = null;

            if (req.file) {
                imagePath = `uploads/users/${req.file.filename}`;
            }
            if (imagePath || removeImage) {
                const filePath = path.join(process.cwd(), user.profile_image || '');

                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }

                });
            }
            if (removeImage) {
                user.profile_image = null
            }
            if (imagePath) {
                user.profile_image = imagePath;
            }
            user.name = name || user.name;
            user.email = email || user.email;
            user.mobile_Number = mobile_Number || user.mobile_Number;
            await user.save();
            return res.status(200).json({
                message: "Profile updated",
                user
            });

        } catch (err) {
            return res.status(500).json({ error: "Update failed" });
        }
    },

    sign_up: async (req, res) => {
        try {
            const { name, email, age, mobile_Number, password, confirmpassword, role } = req.body;
            const { error } = userSchema.validate({ name, email, age, mobile_Number, password });
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const existingUser = await users.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            if (password !== confirmpassword) {
                return res.status(400).json({ error: 'Password and Confirm Password do not match' });
            }
            const userData = JSON.stringify({ name, email, age, mobile_Number, password, role });
            const otp = crypto.randomInt(1000, 9999).toString();
            console.log(otp);
            await redisClient.setEx(`otp_${mobile_Number}`, 60, otp);
            await redisClient.setEx(`userdata_${mobile_Number}`, 60, userData);
            const phone = `+91${mobile_Number}`;
            await sendOTP(phone, otp);
            return res.status(201).json({ message: "OTP sent successfully. Please verify." });
        } catch (error) {

            return res.status(500).json({ error: 'Failed to send OTP' });
        }
    },
    verifyOtp: async (req, res) => {
        try {
            const { otp, mobile_Number } = req.body;
            const storedOtp = await redisClient.get(`otp_${mobile_Number}`);

            if (!storedOtp) {
                return res.status(400).json({ error: 'OTP has expired or is invalid' });
            }
            if (otp !== storedOtp) {
                return res.status(400).json({ error: "Invalid OTP" });
            }

            const userDataJson = await redisClient.get(`userdata_${mobile_Number}`);

            if (!userDataJson) {
                return res.status(400).json({ error: 'User data has expired or is invalid' });
            }
            const { name, email, age, password, role } = JSON.parse(userDataJson);
            const hashedPass = await bcrypt.hash(password, 10);
            const newUser = await users.create({
                name,
                email,
                age,
                mobile_Number,
                password: hashedPass,
                role
            });
            await redisClient.del(`otp_${mobile_Number}`);
            await redisClient.del(`userdata_${mobile_Number}`);
            return res.status(201).json({
                message: "User created successfully",
                user: newUser,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to verify OTP' });
        }
    },
    resendOtp: async (req, res) => {
        try {
            const { mobile_Number } = req.body;
            const otp = crypto.randomInt(1000, 9999).toString();
            console.log(otp);
            await redisClient.setEx(`otp_${mobile_Number}`, 60, otp);
            const phone = `+91${mobile_Number}`;
            await sendOTP(phone, otp);
            return res.status(201).json({ message: "Otp sent Again" });
        } catch (error) {

            return res.status(500).json({ message: "Failed to resend OTP", error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await users.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'User Not Found !' });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Password Didn't Matched ! " })
            }
            if (user.status === "inactive") {
                return res.status(403).json({ error: "Your Account is Blocked. Please Contact Support." });
            }
            const token = jwt.sign({
                id: user.id,
                role: user.role
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mobile_Number: user.mobile_Number,
                    role: user.role,
                    profile_image: user.profile_image || null
                }
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to login' });
        }
    },
    logout: async (req, res) => {
        try {

            const token = req.headers.authorization?.split(" ")[1];

            if (!token) {
                return res.status(400).json({ message: "No token provided" });
            }

            // Store token in Redis blacklist with expiry
            const decoded = jwt.decode(token);

            if (!decoded?.exp) {
                return res.status(400).json({ message: "Invalid token" });
            }

            const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);

            if (expiryTime > 0) {
                await redisClient.setEx(`blacklist_${token}`, expiryTime, "blacklisted");
            }

            return res.status(200).json({ message: "Logout successful" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Logout failed" });
        }
    },

    profile: async (req, res) => {
        try {
            const user = await users.findByPk(req.user.id, {
                attributes: ["id", "name", "email", "profile_image", "role", "mobile_Number"]
            });
            return res.json({ message: "Profile fetched successfully", user });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body
            const user = await users.findOne({ where: { email } })
            if (!user) {
                return res.status(404).json({ error: "User Not Found Please Sign Up" })
            }
            const resetToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );
            const resetLink = `${process.env.CLIENT_URL}?token=${resetToken}`;
            await sendMail({
                to: email,
                subject: "Password Reset Request",
                text: `Click the link to reset your password ${resetLink} `,
            });
            return res.status(200).json({ message: "Password reset link sent to your email" })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to process forgot password request" })
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { token, newPassword, confirmnewpassword } = req.body;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await users.findByPk(decoded.id);
            if (!user) {
                return res.status(404).json({ error: "User Not Found" })
            }
            if (newPassword !== confirmnewpassword) {
                return res.status(400).json({ error: "Password and Confirm Password do not match" })
            }
            const hashedPass = await bcrypt.hash(newPassword, 10)
            user.password = hashedPass;
            await user.save();
            return res.status(200).json({ message: "Password reset successfully" })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to reset password" })
        }
    },


}

export default usersdata ;


