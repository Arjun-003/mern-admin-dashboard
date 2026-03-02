import createUploader from "../utils/upload.js";
const userAvatarUpload = createUploader({
    folder: "uploads/users",
});
export default userAvatarUpload;