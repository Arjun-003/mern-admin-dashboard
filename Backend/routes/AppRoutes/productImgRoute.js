import express from "express"
import productUploadImg from "../../middleware/productUploadImg.js"
import productData from "../../controllers/AppController/productController.js"
import verifyToken from "../../middleware/verifyToken.js"
const router = express.Router()

router.get("/productImages", productData.getallproducts)
router.get("/singleProduct/:id", productData.getSingleProduct)
router.get("/myProducts",verifyToken, productData.myProducts)
router.delete("/deleteProduct/:id", verifyToken, productData.deleteProduct)
router.post("/createProduct", verifyToken, productUploadImg.array("imageUrl", 10), productData.createProduct)


export default router