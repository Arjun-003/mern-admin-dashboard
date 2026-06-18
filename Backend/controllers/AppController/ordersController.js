import { Op } from "sequelize";
import Orders from "../../models/order.js"
import Product from "../../models/product.js";
import Stripe from "stripe";
import dotenv from 'dotenv'
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const ordersController = {
    createOrder: async (req, res) => {
        const { productId } = req.body;
        const { id } = req.user;

        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(400).json({ message: "Product is Not Found" })
            }

            const order = await Orders.findOne({
                where: {
                    [Op.and]: [
                        { userId: id },
                        { productId: productId }
                    ]
                }

            })

            if (order) {
                return res.status(200).json(order)
            } else {
                const createOrder = await Orders.create({
                    productId: productId,
                    price: product.price,
                    userId: id
                })
                res.status(200).json(createOrder);
            }
        } catch (error) {
            console.log(error);
        }
    },

    orderCreateIntent: async (req, res) => {
        const { productId } = req.body;
        const { id } = req.user;
        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(400).json({ message: "Product Didn't Found" })
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: product.price * 100,
                currency: 'inr'
            });
            res.json({
                clientSecret:
                    paymentIntent.client_secret,
            })
            console.log(paymentIntent, 'intent');

        }

        catch (error) {
            console.log("Stripe Error:", error);

            res.status(500).json({
                message: error.message,
            });
        }
    }

}

export default ordersController;