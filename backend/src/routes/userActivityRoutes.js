"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userActivityController_1 = require("../controllers/userActivityController");
const userActivityRouter = (0, express_1.Router)();
userActivityRouter.get("/user-data", authMiddleware_1.default, userActivityController_1.getUserInfo);
userActivityRouter.post("/:userToFollowId/follow", authMiddleware_1.default, userActivityController_1.followOtherUsers);
userActivityRouter.post("/:userToUnfollowId/unfollow", authMiddleware_1.default, userActivityController_1.unfollowOtherUsers);
userActivityRouter.post("/feed", authMiddleware_1.default);
exports.default = userActivityRouter;
