import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { followOtherUsers, getUserInfo } from "../controllers/userActivityController";

const userActivityRouter = Router();

userActivityRouter.get("/user-data", verifyToken, getUserInfo);
userActivityRouter.post("/:userToFollowId/follow", verifyToken, followOtherUsers);
userActivityRouter.post("/feed", verifyToken, );

export default userActivityRouter;
