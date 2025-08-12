import { Router } from "express"
import { llmBlogProcessing } from "../controllers/AIController";
import verifyToken from "../middleware/authMiddleware";

const LLMRouter = Router();

LLMRouter.post("/blog-llm-processing" , verifyToken ,  llmBlogProcessing);

export default LLMRouter;

