import createSubCategory from '../../controllers/AdminController/subCatController.js';
import express from 'express';
const router = express.Router();

router.get('/subcategorie', createSubCategory.showsubCategory);
router.post('/subcategorie', createSubCategory.subcreate);
router.put('/subcategorie/:id', createSubCategory.updatesubCategory);
router.delete('/subcategorie/:id', createSubCategory.deletesubCategory);
router.get('/subcategorie/category/:categoryId', createSubCategory.subcatToCategory);
export default router;