import { Router } from "express"
import { llmBlogProcessing } from "../controllers/AIController";
import verifyToken from "../middleware/authMiddleware";

const socialRoutes = Router();

socialRoutes.post("/follow-suggestions", verifyToken, llmBlogProcessing);

export default socialRoutes;

