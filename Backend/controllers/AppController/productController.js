import { Op } from "sequelize";
import Product from "../../models/product.js";
import ProductImage from "../../models/productImage.js"
import users from "../../models/users.js";
import fs from 'fs'
import path from 'path'
import Like from "../../models/likeProduct.js";
import dotenv from 'dotenv'
import Stripe from "stripe";
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


const productData = {
    myProducts: async (req, res) => {
        try {
            const { id } = req.user;

            const products = await Product.findAll({
                where: { sellerId: id },
                include: [
                    {
                        model: ProductImage,
                        as: "images",           // ✅ alias MUST match
                        separate: true,         // ✅ order safe
                        order: [["order", "ASC"]]
                    }
                ]
            });

            res.status(200).json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    },

    getallproducts: async (req, res) => {
        try {
            const { search, subCategoryId, minPrice, maxPrice, sortBy, page = 1, limit = 6 } = req.query;
            const where = {};


            const currentPage = Number(page) || 1;
            const currentLimit = Number(limit) || 4;

            const offset = (currentPage - 1) * currentLimit;
            // 🔍 Search
            if (search) {
                where.name = {
                    [Op.like]: `%${search}%`
                };
            }
            // 🧩 SubCategory
            if (subCategoryId) {
                where.SubCategoryId = subCategoryId;
            }
            // 💰 Price filter (FIXED)
            const min =
                minPrice !== undefined && minPrice !== ""
                    ? Number(minPrice)
                    : null;
            const max =
                maxPrice !== undefined && maxPrice !== ""
                    ? Number(maxPrice)
                    : null;

            if (min !== null || max !== null) {
                where.price = {};
                if (min !== null) {
                    where.price[Op.gte] = min;
                }
                if (max !== null) {
                    where.price[Op.lte] = max;
                }
            }
            // 🆕 Sort By
            const order = [];
            if (sortBy === "priceLowToHigh") {
                order.push(["price", "ASC"]);
            } else if (sortBy === "priceHighToLow") {
                order.push(["price", "DESC"]);
            } else if (sortBy === "newest") {
                order.push(["createdAt", "DESC"]);
            }

            const products = await Product.findAndCountAll({
                where,
                order,
                include: [
                    {
                        model: ProductImage,
                        as: "images",
                        separate: true,              // IMPORTANT
                        order: [["order", "ASC"]],
                    },
                ],
                limit: Number(limit),
                offset
            });

            res.status(200).json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch products" });
        }
    },

    createProduct: async (req, res) => {
        try {
            const {
                name,
                description,
                condition,
                price,
                categoryId,
                SubCategoryId,
                location,
            } = req.body;

            const userId = req.user.id; // from verifyToken middleware

            // ✔ Validate required fields
            if (!name || !description || !condition || !price || !categoryId || !SubCategoryId || !location) {
                return res.status(400).json({ error: "All fields are required" });
            }

            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const user = await users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const phone = user.mobile_Number;

            // ✔ Validate images
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "At least one product image is required" });
            }

            // 1️⃣ Create product
            const newProduct = await Product.create({
                name,
                description,
                condition,
                price: parseFloat(price),
                phone: phone,
                sellerId: userId,
                categoryId,
                SubCategoryId,
                location
            });

            // 2️⃣ Save multiple images
            const imageRecords = req.files.map((file, index) => ({
                imageUrl: file.path,
                productId: newProduct.id,
                order: index
            }));
            await ProductImage.bulkCreate(imageRecords);

            let accountLink = null;

            if (!user.stripeAccountId) {
                const account = await stripe.accounts.create({
                    type: "express",
                });

                user.stripeAccountId = account.id;

                accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: "http://localhost:5173/seller/refresh",
                    return_url: "http://localhost:5173/seller/success",
                    type: "account_onboarding",
                });
            }
            user.role = "seller";
            await user.save();
            console.log(accountLink,"data of account link");
            
            res.status(201).json({
                message: "Product created successfully",
                product: newProduct,
                images: imageRecords,
                onboardingUrl: accountLink?.url || null
            });

        } catch (error) {
            console.error("Product creation error:", error);
            res.status(500).json({
                error: "Failed to create product",
                details: error.message
            });
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


    // 📌 GET ALL PRODUCTS WITH IMAGES

    getSingleProduct: async (req, res) => {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: ProductImage,
                        as: "images",
                        separate: true,
                        order: [["order", "ASC"]],
                    },
                    {
                        model: Like,
                        as: "likes",
                        attributes: ["userId"] // only needed field
                    }
                ],
            });

            if (!product) {
                return res.status(404).json({ message: "Product Not Found" });
            }

            // ⭐ CHECK IF CURRENT USER LIKED
            const isLiked = product.likes.some(
                like => like.userId === id
            );

            res.status(200).json({
                ...product.toJSON(),
                isLiked
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch product" });
        }
    }

};

export default productData;


