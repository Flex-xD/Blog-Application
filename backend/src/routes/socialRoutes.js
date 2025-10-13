"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const socialController_1 = require("../controllers/socialController");
const blogController_1 = require("../controllers/blogController");
const multerMiddleware_1 = require("../middleware/multerMiddleware");
const socialRoutes = (0, express_1.Router)();
socialRoutes.get("/follow-suggestions", authMiddleware_1.default, socialController_1.followSuggestionForUser);
// ? LIKE , UNLIKE BLOG
socialRoutes.post("/:blogToBeLikedId/like", authMiddleware_1.default, blogController_1.likeOnBlog);
socialRoutes.get("/search-users", authMiddleware_1.default, socialController_1.searchUsersController);
socialRoutes.post("/:blogToUnlikeId/unlike", authMiddleware_1.default, blogController_1.unlikeBlog);
socialRoutes.post("/:blogId/comment", authMiddleware_1.default, blogController_1.commentOnBlog);
socialRoutes.post("/update-profile-picture", authMiddleware_1.default, multerMiddleware_1.upload.single('profilePicture'), socialController_1.updateProfilePicture);
exports.default = socialRoutes;
