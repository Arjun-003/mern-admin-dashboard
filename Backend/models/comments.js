import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/DBconnection.js";
import product from "./product.js";
const Comments = sequelize.define(
  "comments",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userid: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    productid: {
      type: Sequelize.UUID,
      allowNull: false,
      references:{
        model:product,
        key:"id"
      }
    },
    parentCommentId: {
      type: Sequelize.UUID,
      allowNull: true,
    },
  },
  { timestamps: true }
);

export default Comments;
