import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import  redisClient  from "../config/redisClient.js";
dotenv.config();

const verifyToken = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 Check Redis blacklist
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);

    if (isBlacklisted) {
      return res.status(401).json({ message: "Token revoked. Please login again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
export default verifyToken;