import createUploader from "../utils/upload.js";
const productUploadImg = createUploader({
    folder: "uploads/products",
});
export default productUploadImg;