
import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { upload } from "../middleware/multerMiddleware";
import {
    commentOnBlog,
    createBlogController,
    deleteUserBlog,
    getFeaturedBlogs,
    getFeedController,
    getPopularBlogsController,
    getSingleBlogController,
    getUserBlogs,
    getUserSavedBlogs,
    saveBlog,
    searchBlogsController,
    unsaveBlogController,
    userFollowingBlogsController
} from "../controllers/blogController";

const blogRouter = Router();

// ? PUBLIC — landing page exhibit
blogRouter.get("/featured", getFeaturedBlogs);

// ? USER'S FEED
blogRouter.get("/feed", verifyToken, getFeedController);
blogRouter.get("/following-blogs", verifyToken, userFollowingBlogsController);
blogRouter.get("/popular-blogs", verifyToken, getPopularBlogsController);

// ? USER'S BLOGS
blogRouter.get("/user-blogs", verifyToken, getUserBlogs);
blogRouter.get("/saves", verifyToken, getUserSavedBlogs);
blogRouter.get("/search", verifyToken, searchBlogsController);

// ? POST BLOG
blogRouter.post("/create", verifyToken, upload.single("image"), createBlogController);
blogRouter.post("/:blogId/save-blog", verifyToken, saveBlog);
blogRouter.post("/:blogId/unsave-blog", verifyToken, unsaveBlogController);
blogRouter.delete("/:blogId/delete-blog", verifyToken, deleteUserBlog);

// ? SINGLE POST — public read
blogRouter.get("/:blogId", getSingleBlogController);

export default blogRouter;
