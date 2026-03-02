import sequelize from "../config/DBconnection.js";
import { DataTypes, Sequelize } from "sequelize";
import Users from "./users.js";
import Chat from "./chats.js";

const Messages = sequelize.define(
  "messages",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    chatId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Chat,
        key: "id",
      },
    },

    senderId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },

    receiverId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // ⭐ INDUSTRY MESSAGE STATUS SYSTEM

    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }

  },
  {
    timestamps: true
  }
);

// Messages.sync({force: true });

export default Messages;
