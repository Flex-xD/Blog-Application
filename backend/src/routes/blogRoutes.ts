import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { createBlogController, getFeedController, getUserBlogs, getUserSavedBlogs } from "../controllers/blogController";

const blogRouter = Router();

// ? USER'S FEED
blogRouter.get("/get-user-feed" , verifyToken , getFeedController);

// ? USER'S BLOGS
blogRouter.get("/user-blogs" , verifyToken , getUserBlogs);
blogRouter.get("/user-saved-blogs" , verifyToken , getUserSavedBlogs)

// ? POST BLOG
blogRouter.post("/create" , verifyToken , createBlogController);


export default blogRouter;
