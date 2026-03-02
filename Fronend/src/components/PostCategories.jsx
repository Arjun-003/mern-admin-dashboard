import { useContext, useState } from "react";
import { CatContext } from "../context/CategoriesContext.jsx";
import { useNavigate } from "react-router-dom";

const PostCategories = () => {
  const navigate = useNavigate();

  const { categories, subCategories } = useContext(CatContext);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // Filter subcategories based on selected category
  const filteredSubs = subCategories.filter(
    (sub) => sub.categoryId === selectedCategory
  );
  console.log(filteredSubs);
  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("categoryId", selectedCategory);
    localStorage.setItem("subCategoryId", selectedSubCategory);

    navigate("/post-item-detail");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Select Category and Subcategory
        </h2>

        {/* Category Dropdown */}
        <label className="block mb-1 text-gray-700 font-medium">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Subcategory Dropdown */}
        <div className="mt-3">
          <label className="block mb-1 text-gray-700 font-medium">Subcategory</label>

          <select
            value={selectedSubCategory}
            disabled={!selectedCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select Subcategory</option>

            {filteredSubs.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.title}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedSubCategory}
          className="mt-4 w-full py-2 rounded-md bg-yellow-500 text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PostCategories;
