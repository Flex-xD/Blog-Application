import { Router } from "express";
import { loginController, logoutController, registerController } from "../controllers/authController";
import verifyToken from "../middleware/authMiddleware";

const authRouter = Router();

authRouter.post("/register" , verifyToken, registerController);
authRouter.post("/login" , verifyToken , loginController);
authRouter.post("/logout" , verifyToken , logoutController);

export default authRouter;
