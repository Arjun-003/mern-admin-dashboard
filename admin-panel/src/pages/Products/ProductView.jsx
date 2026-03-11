import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useApi from '../../api/hooks/useApi.jsx';
import { useAuth } from '../../context/AuthProvider.jsx';
import ApiEndPoint from '../../api/Constants/ApiEndPoint.jsx';


const ProductDetail = () => {

  const { getDataByParams, deleteData } = useApi();

  const navigate = useNavigate()
  const { user, token, loading } = useAuth();
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false);

  const { productId } = useParams();

  console.log(productId, "this is the product ID from the url");
  //    For fetching the product data
  useEffect(() => {
    const getProduct = async () => {
      const response = await getDataByParams(ApiEndPoint.getSingleProduct, productId);
      setProduct(response.data)
      setImages(response.data.images || [])

      console.log(response.data, "this is the product data from the API");
    }
    getProduct()
  }, [productId]);


  if (!product) return <p className="text-center mt-10">Loading...</p>


  const nextImage = () => {
    if (images.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (images.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Product Delete Function
  const deleteItem = async () => {
    try {
      const response = await deleteData(ApiEndPoint.deleteProduct, product.id);
      if (response.status === 200) {
        alert("Product deleted successfully");
        navigate("/profile", { replace: true });
      } else {
        alert("Failed to delete product");
      }
    }
    catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* IMAGE SECTION */}
        <div className="w-full">

          <div className="relative w-full h-[450px] rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center">

            {images?.length > 0 ? (
              <img
                src={`${ApiEndPoint.IMAGE_BASE_URL}${images[currentIndex].imageUrl.replace(/\\/g, "/")}`}
                className="max-h-full object-contain"
              />
            ) : (
              <p className="text-gray-400">No Images</p>
            )}

            {/* Prev */}
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow-md px-3 py-2 rounded-full hover:bg-gray-100"
            >
              ‹
            </button>

            {/* Next */}
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow-md px-3 py-2 rounded-full hover:bg-gray-100"
            >
              ›
            </button>

          </div>

        </div>

        {/* PRODUCT DETAILS */}
        <div className="flex flex-col gap-5">

          <h1 className="text-3xl font-bold text-gray-900">
            {product?.name}
          </h1>

          <p className="text-2xl font-semibold text-green-600">
            ₹ {product?.price}
          </p>

          <div className="border-t border-b py-4 text-gray-700">
            {product?.description}
          </div>

          <div className="space-y-2 text-gray-600">

            <p>
              <span className="font-semibold text-gray-800">Location:</span>{" "}
              {product?.location}
            </p>

            <p>
              <span className="font-semibold text-gray-800">Condition:</span>{" "}
              {product?.condition}
            </p>

          </div>

          {/* ACTION BUTTON */}
          <div className="pt-6">

            <button
              onClick={deleteItem}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Delete Product
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProductDetail;
