import { Router } from "express";
import { loginController, logoutController, registerController } from "../controllers/authController";
import verifyToken from "../middleware/authMiddleware";

const blogRouter = Router();

blogRouter.post("/get" , verifyToken , registerController);
blogRouter.post("/create" , verifyToken , loginController);
blogRouter.post("/delete" , verifyToken , logoutController);

export default blogRouter;
