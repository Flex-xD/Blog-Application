import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { upload } from "../middleware/multerMiddleware";
import { createBlogController, getFeedController, getUserBlogs, getUserSavedBlogs } from "../controllers/blogController";

const blogRouter = Router();

// ? USER'S FEED
blogRouter.get("/feed", verifyToken, getFeedController);

// ? USER'S BLOGS
blogRouter.get("/user-blogs", verifyToken, getUserBlogs);
blogRouter.get("/user-saved-blogs", verifyToken, getUserSavedBlogs)

// ? POST BLOG
blogRouter.post("/create", verifyToken, upload.single('image'), createBlogController);


export default blogRouter;
