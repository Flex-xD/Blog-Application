import { Router } from "express";
import verifyToken from "../middleware/authMiddleware";
import { followOtherUsers, getUserInfo, unfollowOtherUsers } from "../controllers/userActivityController";

const userActivityRouter = Router();

userActivityRouter.get("/user-data", verifyToken, getUserInfo);
userActivityRouter.post("/:userToFollowId/follow", verifyToken, followOtherUsers);
userActivityRouter.post("/:userToUnfollowId/unfollow", verifyToken, unfollowOtherUsers);
userActivityRouter.post("/feed", verifyToken, );

export default userActivityRouter;
