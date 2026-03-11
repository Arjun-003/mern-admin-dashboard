import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCat } from "../context/CategoriesContext.jsx";

const Main = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories, subCategories } = useCat();
  const [postData, setPostData] = useState([]);

  const [priceRange, setPriceRange] = useState(
    {
      min: "",
      max: ""
    });
  // Update preview image whenever user changes

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/productImages?${searchParams.toString()}`);
        setPostData(response.data);
       
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPosts();
  }, [searchParams]);

 

  return (
    <>

      {/* Main Content */}
      <section className="flex bg-gray-100 mt-36 pt-4">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Filters</h2>

        <div className="border-b border-gray-300 mb-4">
          <h2 className="text-md font-medium text-gray-600 mb-2">Sort By</h2>
          <select
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={searchParams.get("sortBy") || ""}
            
            onChange={(e) => {
              const value = e.target.value;
              setSearchParams(prev => {
                const params = new URLSearchParams(prev.toString());
                if (value) {
                  params.set("sortBy", value);
                }
                else {
                  params.delete("sortBy");
                }
                return params;
              });
            }}
          >
            <option value="">Sort By </option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
           </select>

        </div>
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-600 mb-2">Category</h3>

            {categories.map((cat) => {
              return (
                <div key={cat.id} className="mb-4">
                  {/* Category Title */}
                  <h3 className="text-gray-700 font-bold mb-2">
                    {cat.title}
                  </h3>

                  {/* List of Subcategories */}
                  <ul className="space-y-1">
                    {subCategories
                      .filter((sub) => cat.id === sub.categoryId)
                      .map((subcate) => (
                        <li
                          key={subcate.id}
                          onClick={() => {
                            setSearchParams(prev => {
                              const params = new URLSearchParams(prev.toString());
                              params.set("subCategoryId", subcate.id);
                              return params;
                            });
                          }}
                  
                          className={
                            searchParams.get("subCategoryId") == subcate.id ? "font-medium bg-yellow-500 text-white p-2 rounded-md cursor-pointer" : "font-medium text-gray-600 cursor-pointer hover:text-yellow-400"
                          }
                        >
                          {subcate.title}
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-600 mb-2">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                name="min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="number"
                placeholder="Max"
                name="max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
          {/* Clear Filters Button */}
            <button className="w-full bg-gray-300 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-400 mb-4"
            onClick={() => {
              setPriceRange({ min: "", max: "" });
              setSearchParams("");
            }}
          >
            Clear Filters
          </button>
          {/* Apply Filters Button */}
          <button className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-md hover:bg-yellow-600"
            onClick={() => {
              setSearchParams(prev => {
                const params = new URLSearchParams(prev);

                if (priceRange.min) {
                  params.set("minPrice", priceRange.min);
                } else {
                  params.delete("minPrice");
                }

                if (priceRange.max) {
                  params.set("maxPrice", priceRange.max);
                } else {
                  params.delete("maxPrice");
                }

                return params;
              });
            }}>
            Apply Filters
          </button>
        </aside>

        {/* Main Right Content */}
        <main className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {postData.length === 0 ? (
                <p className="text-gray-500">No items found matching your criteria.</p>
              ) : (
              postData.map((post) => {
                const getImage = (post) => {
                  if (post.images.length === 0) {
                    return "https://via.placeholder.com/300";
                  }
                  return `http://localhost:5000/${post.images[0].imageUrl}`;
                };

                return (
                  <div
                    key={post.id}
                    className="border rounded-lg shadow hover:shadow-lg transition p-3"
                    onClick={() => navigate(`/item-detail/${post.id}`)}
                  >
                    <img
                      src={getImage(post)}
                      alt={post.name}
                      className="w-full h-48 object-cover rounded-md" />

                    <h2 className="text-xl font-bold text-gray-800 mt-3">
                      ₹ {post.price}
                    </h2>

                    <p className="text-gray-600 font-medium">{post.name}</p>
                    <p className="text-gray-500">{post.location}</p>

                    <p className="text-xs text-gray-400 mt-2">
                      Posted on: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
)}
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default Main;
