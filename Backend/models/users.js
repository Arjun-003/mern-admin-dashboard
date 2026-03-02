import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/DBconnection.js";

const Users = sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    age:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    mobile_Number: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "seller"),
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "banned"),
      defaultValue: "active",
    },
    logInTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    logOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
  },
  {
    timestamps: true
  }
  
);

export default Users;
