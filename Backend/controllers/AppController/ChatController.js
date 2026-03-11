import { Op } from "sequelize";
import Chat from "../../models/chats.js";
import Messages from "../../models/messages.js";
import User from "../../models/users.js";
import Product from "../../models/product.js";
import ProductImage from "../../models/productImage.js";

const ChatData = {

  // GET USER CHAT LIST (INITIAL LOAD)
  getUserChats: async (req, res) => {

    try {

      const userId = req.user.id;

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
            attributes: ["id","message","createdAt","senderId"]
          },
          {
            model: Product,
            as: "product",
            attributes: ["id","name","price"],
            include: [{
              model: ProductImage,
              as: "images",
              attributes: ["id","imageUrl"],
              limit: 1
            }]
          },
          {
            model: User,
            as: "sender",
            attributes: ["id","name","profile_image"]
          },
          {
            model: User,
            as: "receiver",
            attributes: ["id","name","profile_image"]
          }
        ],

        order: [["updatedAt","DESC"]]
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

      return res.status(200).json(result);

    } catch (error) {

      console.error("getUserChats error:", error);

      return res.status(500).json({
        message: "Failed to fetch chats"
      });

    }

  }

};

export default ChatData;
