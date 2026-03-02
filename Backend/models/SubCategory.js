import sequelize from "../config/DBconnection.js";
import category from "./category.js";
import { DataTypes, Sequelize } from "sequelize";
import slugify from "slugify";

const SubCategory = sequelize.define(
  "subcategories",  // ✅ FINAL TABLE NAME (no auto–plural)
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(50),
    },
    categoryId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: category,  // ✅ reference model object (correct)
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    freezeTableName: true, // 🔥 FIXES THE MYSQL ERROR
  }
);
// Auto-generate slug
SubCategory.beforeCreate((subCategory) => {
  subCategory.slug = slugify(subCategory.title, { lower: true });
});

export default SubCategory;
