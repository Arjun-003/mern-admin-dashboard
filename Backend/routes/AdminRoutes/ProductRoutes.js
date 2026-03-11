import productData from "../../controllers/AdminController/ProductController.js";
import verifyToken from "../../middleware/verifyToken.js";
import express from 'express';

const router = express.Router();

router.get('/getallproducts', verifyToken, productData.getallproducts);
router.get('/getSingleProduct/:productId', verifyToken, productData.getSingleProduct);
// router.delete('/deleteProduct/:id', verifyToken, productData.deleteProduct);

export default router;