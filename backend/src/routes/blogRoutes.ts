import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { createBlogController, getUserBlogs } from "../controllers/blogController";

const blogRouter = Router();

blogRouter.get("/get-user-feed" , verifyToken , getUserBlogs);
blogRouter.post("/create" , verifyToken , createBlogController);
blogRouter.get("/user-blogs" , verifyToken , getUserBlogs);

export default blogRouter;
