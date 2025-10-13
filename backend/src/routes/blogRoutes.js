"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const multerMiddleware_1 = require("../middleware/multerMiddleware");
const blogController_1 = require("../controllers/blogController");
const blogRouter = (0, express_1.Router)();
// ? USER'S FEED
blogRouter.get("/feed", authMiddleware_1.default, blogController_1.getFeedController);
blogRouter.get("/following-blogs", authMiddleware_1.default, blogController_1.userFollowingBlogsController);
blogRouter.get("/popular-blogs", authMiddleware_1.default, blogController_1.getPopularBlogsController);
// ? USER'S BLOGS
blogRouter.get("/user-blogs", authMiddleware_1.default, blogController_1.getUserBlogs);
blogRouter.get("/saves", authMiddleware_1.default, blogController_1.getUserSavedBlogs);
blogRouter.get("/search", authMiddleware_1.default, blogController_1.searchBlogsController);
// ? POST BLOG
blogRouter.post("/create", authMiddleware_1.default, multerMiddleware_1.upload.single('image'), blogController_1.createBlogController);
blogRouter.post("/:blogId/save-blog", authMiddleware_1.default, blogController_1.saveBlog);
blogRouter.post("/:blogId/unsave-blog", authMiddleware_1.default, blogController_1.unsaveBlogController);
blogRouter.delete("/:blogId/delete-blog", authMiddleware_1.default, blogController_1.deleteUserBlog);
exports.default = blogRouter;
