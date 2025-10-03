import { Router } from "express"
import verifyToken from "../middleware/authMiddleware";
import { followSuggestionForUser } from "../controllers/socialController";
import { commentOnBlog, likeOnBlog, unlikeBlog } from "../controllers/blogController";

const socialRoutes = Router();

socialRoutes.get("/follow-suggestions", verifyToken, followSuggestionForUser);

// ? LIKE , UNLIKE BLOG
socialRoutes.post("/:blogToBeLikedId/like", verifyToken, likeOnBlog);

socialRoutes.post("/:blogToUnlikeId/unlike", verifyToken, unlikeBlog);
socialRoutes.post("/:blogId/comment" , verifyToken ,  commentOnBlog);

export default socialRoutes;

