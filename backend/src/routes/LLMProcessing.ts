import { Router } from "express"
import { llmBlogProcessing } from "../controllers/AIController";

const LLMRouter = Router();

LLMRouter.post("/blog-llm-processing" , llmBlogProcessing);

export default LLMRouter;

