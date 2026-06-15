import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/DBconnection.js";
import Products from "./product.js";
import Users from "./users.js";

const Orders = sequelize.define(
    "orders",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
        },
        productId: {
            type: Sequelize.UUID,
            allowNull: false,
            references:{
                model:Products,
                key:'id'
            }
        },
        userId:{
            type:Sequelize.UUID,
            allowNull:false,
            references:{
                model:Users,
                key:"id"
            }
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "paid", "reject"),
            defaultValue: "pending",
        },
        
    },
    {
        timestamps: true
    }

);
Orders.sync({force:false});
export default Orders;
