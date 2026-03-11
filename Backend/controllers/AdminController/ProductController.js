import { Op } from "sequelize";
import Product from "../../models/product.js";
import ProductImage from "../../models/productImage.js"
import users from "../../models/users.js";
import fs from 'fs'
import path from 'path'
import Like from "../../models/likeProduct.js";
import category from "../../models/category.js";

const productData = {
    getallproducts: async (req, res) => {
        try {

            const { page = 1, limit = 10, search = "", status } = req.query;

            const pageNumber = Math.max(1, parseInt(page));
            const pageSize = Math.max(1, parseInt(limit));
            const offset = (pageNumber - 1) * pageSize;

            const where = {};

            if (status) {
                where.status = status;
            }

            // search
            if (search) {
                where.name = {
                    [Op.like]: `%${search}%`
                };
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                limit: pageSize,
                offset,
                include: [
                    {
                        model: ProductImage,
                        as: "images",
                        limit: 1, // only fetch 1 image for listing
                        separate: true,
                        order: [["order", "ASC"]],
                    },
                    {
                        model: users,
                        as: "productUser",
                        attributes: ["id", "name", "email"]
                    },
                    {
                        model: category,
                        as: "productCategory",
                        attributes: ["id", "title"] // only needed field
                    }


                ]
            });

            res.status(200).json({
                success: true,
                data: rows,
                pagination: {
                    totalRecords: count,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: pageNumber
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch products" });
        }
    },
    getSingleProduct: async (req, res) => {
        try {
            const { productId } = req.params;

            const product = await Product.findByPk(productId, {
                include: [
                    {
                        model: ProductImage,
                        as: "images",
                        separate: true,
                        order: [["order", "ASC"]],
                    }
                ],
            });

            if (!product) {
                return res.status(404).json({ message: "Product Not Found" });
            }
            res.status(200).json({
                success: true,
                data: product
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch product" });
        }
    },

    // 📌 DELETE A PRODUCT AND ITS IMAGES
    deleteProduct: async (req, res) => {

        try {

            const { id } = req.params;
            const userId = req.user.id;
            // ⭐ First check product exists + ownership
            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            if (product.sellerId !== userId) {
                return res.status(403).json({ message: "Unauthorized to delete this product" });
            }

            // ⭐ Fetch images AFTER ownership check
            const images = await ProductImage.findAll({
                where: { productId: id }
            });

            // ⭐ Delete files safely (async)
            for (const img of images) {

                const imgPath = path.join(process.cwd(), img.imageUrl);

                try {
                    if (fs.existsSync(imgPath)) {
                        await fs.promises.unlink(imgPath);
                    }
                } catch (err) {
                    console.log("Image delete failed:", imgPath);
                }
            }
            // ⭐ Delete DB records
            await Like.destroy({
                where: { productId: id }
            });
            await ProductImage.destroy({ where: { productId: id } });
            await Product.destroy({ where: { id } });

            return res.status(200).json({
                message: "Product deleted successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Failed to delete product"
            });
        }
    },


};

export default productData;