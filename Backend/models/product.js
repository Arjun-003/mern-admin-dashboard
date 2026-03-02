import sequelize from "../config/DBconnection.js";
import category from "./category.js";
import { DataTypes, Sequelize } from "sequelize";
import SubCategory from "./SubCategory.js";
import users from "../models/users.js";
import slugify from "slugify";

const product = sequelize.define("product", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(100),
        
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    condition: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(12),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sellerId:{
        type: Sequelize.UUID,
        allowNull:false,
        references:{
            model:users,
            key:"id"
        }
    },
    categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: category,
            key: "id"
        }
    },
    SubCategoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: SubCategory,
            key: "id",
        },
    },
}, 
);
// Auto-generate slug before creating
// sequelize.sync({force:true})
product.beforeCreate((product) => {
    product.slug = slugify(product.name, { lower: true });
});

export default product;