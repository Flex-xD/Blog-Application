import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { upload } from "../middleware/multerMiddleware";
import { createBlogController, getFeedController, getUserBlogs, getUserSavedBlogs, likeOnBlog, unlikeBlog } from "../controllers/blogController";

const blogRouter = Router();

// ? USER'S FEED
blogRouter.get("/feed", verifyToken, getFeedController);

// ? USER'S BLOGS
blogRouter.get("/user-blogs", verifyToken, getUserBlogs);
blogRouter.get("/user-saved-blogs", verifyToken, getUserSavedBlogs)

// ? POST BLOG
blogRouter.post("/create", verifyToken, upload.single('image'), createBlogController);
blogRouter.post("/:blogToBeLikedId/like", verifyToken, likeOnBlog);

// ? LIKE  , UNLIKE AND COMMENT ON BLOG
blogRouter.post("/like", verifyToken, likeOnBlog);
blogRouter.post("/unlike", verifyToken, unlikeBlog);

export default blogRouter;
