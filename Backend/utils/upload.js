import multer from "multer";
import path from "path";
import fs from "fs";

const createUploader = ({
    folder = "uploads",
    maxSizeMB = 2,
    allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
}) => {

    // Ensure folder exists
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    // Storage config
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, folder);
        },
        filename: (req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, unique + ext);
        },
    });

    // File filter
    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
    });
};

export default createUploader;
