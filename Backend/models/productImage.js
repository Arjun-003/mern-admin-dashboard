import sequelize from "../config/DBconnection.js";
import { Sequelize, DataTypes } from "sequelize";
import product from "./product.js";
const ProductImage = sequelize.define("ProductImage", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: product,
            key: "id"
        },
        onDelete: "CASCADE"
    }
});
// ProductImage.sync({force:true})
export default ProductImage