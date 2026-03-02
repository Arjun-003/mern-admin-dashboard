import sequelize from "../config/DBconnection.js";
import { Sequelize } from "sequelize";
import Product from "./product.js";
import Users from "./users.js";

const Like = sequelize.define("likes", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },

  productId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: "id",
    },
  },

  userId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
},
{
  indexes: [
    {
      unique: true,
      fields: ["userId", "productId"], // ⭐ prevents duplicate likes
    },
  ],
});

export default Like;
