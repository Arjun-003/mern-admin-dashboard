import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Chat from "../models/chats.js";
import Messages from "../models/messages.js";
import { Op } from "sequelize";
import dotenv from "dotenv";
import Product from "../models/product.js";
import Users from "../models/users.js";
import ProductImage from "../models/productImage.js";
dotenv.config();

let io;

const initSocket = (server) => {

  // 1️⃣ Create socket server FIRST
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174"
      ],
      credentials: true,
    },
  });

  // 2️⃣ Socket Authentication Middleware
  io.use((socket, next) => {
    try {

      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // attach user to socket
      socket.userId = decoded.id;

      next();

    } catch (err) {
      console.log("Socket auth error:", err.message);

      next(new Error("Unauthorized"));
    }
  });

  // 3️⃣ Connection
  io.on("connection", (socket) => {

    console.log("Socket connected:", socket.id);
    // user room
    socket.join(`user:${socket.userId}`);
    console.log(`User ${socket.userId} joined`);

    // Checking the read Count
    socket.on("unreadCountUpdate", async () => {
      try {

        const userId = socket.userId;

        const chats = await Chat.findAll({
          where: {
            [Op.or]: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          attributes: [
            "senderId",
            "receiverId",
            "unreadCountForSender",
            "unreadCountForReceiver"
          ]
        });

        let totalUnread = 0;

        chats.forEach(chat => {

          if (chat.senderId === userId) {

            totalUnread += chat.unreadCountForSender;

          } else {

            totalUnread += chat.unreadCountForReceiver;

          }

        });

        socket.emit("unreadcounts", totalUnread);

      } catch (error) {

        console.log(error);

      }
    });

    // Mark As Read
    socket.on("markAsRead", async ({ chatId }) => {
      try {
        const userId = socket.userId;

        const chats = await Chat.findOne({
          where: {
            id: chatId
          }
        });


        if (!chats) return;

        if (chats.senderId == userId) {
          chats.unreadCountForSender = 0;
        } else {
          chats.unreadCountForReceiver = 0;
        }

        await chats.save();

      } catch (error) {
        console.log(error);
      }
    });

    // Get Chats of User

    socket.on("getUserChats", async () => {

      try {

        const userId = socket.userId;

        const chats = await Chat.findAll({
          where: {
            [Op.or]: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },

          attributes: [
            "id",
            "senderId",
            "receiverId",
            "productId",
            "updatedAt",
            "unreadCountForSender",
            "unreadCountForReceiver"
          ],

          include: [
            {
              model: Messages,
              as: "lastMessage",
              attributes: ["id", "message", "createdAt", "senderId"]
            },
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price"],
              include: [{
                model: ProductImage,
                as: "images",
                attributes: ["id", "imageUrl"],
                limit: 1
              }]
            },
            {
              model: Users,
              as: "sender",
              attributes: ["id", "name", "profile_image"]
            },
            {
              model: Users,
              as: "receiver",
              attributes: ["id", "name", "profile_image"]
            }
          ],

          order: [["updatedAt", "DESC"]]
        });
        const result = chats.map(chat => {
          const data = chat.get({ plain: true });
          return {
            ...data,
            unreadCount:
              userId === data.senderId
                ? data.unreadCountForSender
                : data.unreadCountForReceiver
          };

        });

        socket.emit("takeChats", result);

      } catch (error) {

        console.error("getUserChats error:", error);

        return res.status(500).json({
          message: "Failed to fetch chats"
        });

      }

    })



    // SEND MESSAGE
    socket.on("sendMessage", async (data) => {

      try {
        const senderId = socket.userId;
        const { receiverId, productId, message } = data;

        let chat = await Chat.findOne({
          where: {
            productId,
            [Op.or]: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId }
            ]
          }
        });

        if (!chat) {
          chat = await Chat.create({
            senderId,
            receiverId,
            productId
          });
        }

        const newMessage = await Messages.create({
          chatId: chat.id,
          senderId,
          receiverId,
          message
        });

        await chat.update({
          lastMessageId: newMessage.id
        });

        await chat.increment(
          senderId === chat.senderId
            ? "unreadCountForReceiver"
            : "unreadCountForSender"
        );
        io.to(`user:${receiverId}`).emit(
          "refreshUnread"
        );

        io.to(`user:${receiverId}`).emit(
          "newMessage",
          newMessage
        );

        io.to(`user:${senderId}`).emit(
          "newMessage",
          newMessage
        );


      } catch (err) {
        console.log("sendMessage error:", err);
      }
    });

    // disconnect
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

export default initSocket;