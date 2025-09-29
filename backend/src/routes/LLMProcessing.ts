import { Router } from "express"
import { llmBlogProcessing } from "../controllers/AIController";
import verifyToken from "../middleware/authMiddleware";

const LLMRouter = Router();

LLMRouter.post("/ai-enhancing" , verifyToken ,  llmBlogProcessing);

export default LLMRouter;

