import { Router } from "express"
import verifyToken from "../middleware/authMiddleware";
import { followSuggestionForUser, searchUsersController, updateProfilePicture } from "../controllers/socialController";
import { commentOnBlog, likeOnBlog, unlikeBlog } from "../controllers/blogController";
import { upload } from "../middleware/multerMiddleware";

const socialRoutes = Router();

socialRoutes.get("/follow-suggestions", verifyToken, followSuggestionForUser);

// ? LIKE , UNLIKE BLOG
socialRoutes.post("/:blogToBeLikedId/like", verifyToken, likeOnBlog);
socialRoutes.get("/search-users" , verifyToken , searchUsersController);

socialRoutes.post("/:blogToUnlikeId/unlike", verifyToken, unlikeBlog);
socialRoutes.post("/:blogId/comment" , verifyToken ,  commentOnBlog);
socialRoutes.post("/update-profile-picture" , verifyToken ,   upload.single('profilePicture'), updateProfilePicture);

export default socialRoutes;

