import { Router } from "express";
import { getUserInfo, loginController, logoutController, registerController } from "../controllers/authController";
import verifyToken from "../middleware/authMiddleware";

const authRouter = Router();

authRouter.get("/user-data" , verifyToken , getUserInfo);
authRouter.post("/register" , registerController);
authRouter.post("/login"  , loginController);
authRouter.post("/logout"  , logoutController);

export default authRouter;
