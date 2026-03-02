import SubCategory from "../../models/SubCategory.js";
import category from "../../models/category.js";
// Create a new sub-category     
const createSubCategory = {
    showsubCategory: async(req, res) => {
        try {
            const subCategories = await SubCategory.findAll();
            res.status(200).json(subCategories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    subcatToCategory: async(req, res) => {
        try {
            const { categoryId } = req.params;  
            const subCategories = await SubCategory.findAll({ where: { categoryId }}
            );
            res.status(200).json(subCategories);
            
        } catch (error) {
            res.status(500).json({ message: error.message });
        }},

    subcreate: async(req, res) => {
        try {
            const { title, categoryId } = req.body;
            // Check if the category exists
            const existingCategory = await category.findByPk(categoryId);

            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
            const newSubCategory = await SubCategory.create({ title, categoryId });
            res.status(201).json(newSubCategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updatesubCategory: async(req, res) => {
        try{
            const { id } = req.params;
            const { title} = req.body;
            const subCategory = await SubCategory.findByPk(id);
            if (!subCategory) {
                return res.status(404).json({ message: 'Sub-category not found' });
            }
            subCategory.title = title || subCategory.title;
            await subCategory.save();
            res.status(200).json(subCategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deletesubCategory: async(req, res) => {
        try {
            const { id } = req.params;
            const deleted = await SubCategory.destroy({ where: { id } });
            if (deleted) {
                res.status(200).json({ message: 'Sub-category deleted successfully' });
            }
            else {
                res.status(404).json({ message: 'Sub-category not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

};
export default createSubCategory;