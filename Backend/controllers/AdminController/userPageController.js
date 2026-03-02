import User from "../../models/users.js";
import fs from "fs/promises";
import path from "path";

const userController = {
    updateUserStatus: async (req, res) => {
        try {
            const { userId, status } = req.body;

            // 1️⃣ Validation
            if (!userId || !status) {
                return res.status(400).json({
                    success: false,
                    message: "userId and status are required",
                });
            }

            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status value",
                });
            }

            // 2️⃣ Find user
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // 3️⃣ Update status
            user.status = status;
            await user.save();

            // 4️⃣ Success response
            return res.status(200).json({
                success: true,
                message: "User status updated successfully",
                data: {
                    userId: user._id,
                    status: user.status,
                },
            });

        } catch (error) {
            console.error("🔥 STATUS UPDATE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    // User Details
    userDetail: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            console.error("🔥 USER DETAIL ERROR:", error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    AdminProfileUpdate: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            const { name, email, mobile_Number, removeImage } = req.body;

            let imagePath = null;

            if (req.file) {
                imagePath = `uploads/users/${req.file.filename}`;
            }
            if ((imagePath || removeImage) && user.profile_image) {
                try {
                    const filePath = path.join(process.cwd(), user.profile_image);
                    await fs.unlink(filePath);
                } catch (err) {
                    console.error("Error deleting old image:", err.message);
                }
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
}

export default userController;