import { Router } from "express"
import verifyToken from "../middleware/authMiddleware";
import { followSuggestionForUser } from "../controllers/socialController";

const socialRoutes = Router();

socialRoutes.get("/follow-suggestions", verifyToken, followSuggestionForUser);

export default socialRoutes;

