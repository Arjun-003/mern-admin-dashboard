import category from '../../models/category.js';
import SubCategory from '../../models/SubCategory.js';
const categorydata = {
    getCateGory: async(req, res) => {
        try {
            const categoryList = await category.findAll();
            res.status(200).json(categoryList);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch category' });
        }
    },
    categoryInsert: async(req, res) => {
        try {
            const { title } = req.body;
            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }
            const newCategory = await category.create({ title });
            res.status(201).json(newCategory, "successfully created");
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create category' });
        }
    },
    deleteCategory: async(req, res) => {
        try {
            const { id } = req.params;
            const deleted = await category.destroy({ where: { id } });
            if (deleted) {
                res.status(200).json({ message: 'Category deleted successfully' });
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete category' });
        }
    },

    // Get all categories with their subcategories
    getAllCategories: async(req, res) => {
        try {
            const categories = await category.findAll({
                include: [{
                    model: SubCategory,
                    as: 'subCategories', // alias for clarity (optional)
                    attributes: ['id', 'title', 'slug'], // select only needed fields
                }, ],
            });

            res.status(200).json({
                success: true,
                message: "Categories fetched successfully",
                data: categories,
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch categories",
            });
        }
    },

    // Get a single category by ID (with its subcategories)
    getCategoryById: async(req, res) => {
        try {
            const { slug } = req.params;
            const singleCategory = await category.findOne({
                where: { slug },
                include: [{
                    model: SubCategory,
                    as: 'subCategories',
                    attributes: ['id', 'title', 'slug'],
                }, ],
            });

            if (!singleCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            res.status(200).json({
                success: true,
                data: singleCategory,
            });
        } catch (error) {
            console.error("Error fetching category:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch category",
            });
        }
    }

}

export default categorydata;