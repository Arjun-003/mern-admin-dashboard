import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/DBconnection.js";
import slugify from "slugify";

const category = sequelize.define('category', {
     id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(50)
    }
});

category.beforeCreate((category) => {
    category.slug = slugify(category.title, { lower: true });
});
export default category;