import { Sequelize } from "sequelize";
import sequelize from "../config/DBconnection.js";
import Users from "./users.js";
import Product from "./product.js";

const Chat = sequelize.define(
  "chats",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    senderId: {  // camelCase
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },
    receiverId: {  // camelCase
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },
    productId: {  // camelCase
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    unreadCountForSender: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    unreadCountForReceiver: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    lastMessageId: {
      type: Sequelize.UUID,
      allowNull: true,
    },
  },
  { timestamps: true }
);
// Chat.sync({force: true});

export default Chat;
