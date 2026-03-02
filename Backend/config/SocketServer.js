import { Server } from "socket.io";
import Chat from "../models/chats.js";
import Messages from "../models/messages.js";
import { Op } from "sequelize";

const initSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          "http://localhost:5173",
          "http://localhost:5174"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true
    }
  });

  io.on("connection", (socket) => {

    console.log("Socket connected:", socket.id);

    // USER JOIN
    socket.on("join", (userId) => {

      if (!userId) return;

      socket.userId = userId;

      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });


    // SEND MESSAGE
    socket.on("sendMessage", async (data) => {

      try {

        const senderId = socket.userId;

        if (!senderId) return;

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

        // SEND MESSAGE TO BOTH USERS
        io.to(`user:${receiverId}`).emit("newMessage", newMessage);
        io.to(`user:${senderId}`).emit("newMessage", newMessage);

      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });


    // GET MESSAGES HISTORY
    socket.on("getMessages", async ({ receiverId, productId }) => {

      try {

        const senderId = socket.userId;

        const chat = await Chat.findOne({
          where: {
            [Op.or]: [
              { senderId, receiverId, productId },
              { senderId: receiverId, receiverId: senderId, productId }
            ]
          }
        });

        if (!chat) {
          socket.emit("messagesData", []);
          return;
        }

        const messages = await Messages.findAll({
          where: { chatId: chat.id },
          order: [["createdAt", "ASC"]]
        });

        socket.emit("messagesData", messages);

      } catch (err) {

        console.error(err);

      }

    });


    // MARK READ
    socket.on("markAsRead", async ({ chatId }) => {

      try {

        const userId = socket.userId;

        const chat = await Chat.findByPk(chatId);

        if (!chat) return;

        if (userId === chat.senderId) {

          await chat.update({ unreadCountForSender: 0 });

        } else {

          await chat.update({ unreadCountForReceiver: 0 });

        }

        await Messages.update(
          { isRead: true },
          {
            where: {
              chatId,
              receiverId: userId,
              isRead: false
            }
          }
        );

      } catch (err) {

        console.error(err);

      }

    });


    socket.on("disconnect", () => {

      console.log("Socket disconnected:", socket.id);

    });

  });

  return io;
};

export default initSocket;
