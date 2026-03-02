import categorydata from "../../controllers/AdminController/CategoryController.js";
import express from "express";
const router = express.Router();

router.get('/category', categorydata.getCateGory);
router.post('/cateinsert', categorydata.categoryInsert);
router.delete('/deletecategory/:id', categorydata.deleteCategory);

router.get('/allcategories', categorydata.getAllCategories);
router.get('/category/:slug', categorydata.getCategoryById);
export default router;