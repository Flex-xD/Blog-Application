"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error("Only JPEG, PNG, WEBP, GIF images are allowed."));
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE_BYTES },
});
