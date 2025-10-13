"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowOtherUsers = exports.followOtherUsers = exports.getUserInfo = void 0;
const http_status_codes_1 = require("http-status-codes");
const helperFunction_1 = require("../utils/helperFunction");
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../utils");
const getUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const response = yield userModel_1.default.findById(userId).populate("userBlogs").populate("saves").populate("following followers");
        if (!response)
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "There was an issue fetching user data !"
            });
        (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "User data fetched successfully !",
            data: response
        });
    }
    catch (error) {
        console.log({ error });
        return (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.getUserInfo = getUserInfo;
function withTransactionRetry(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, maxRetries = 3) {
        var _a;
        const session = yield mongoose_1.default.startSession();
        try {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    session.startTransaction();
                    const result = yield fn(session);
                    yield session.commitTransaction();
                    return result;
                }
                catch (err) {
                    yield session.abortTransaction();
                    // Only retry for transient errors
                    if (!((_a = err.errorLabels) === null || _a === void 0 ? void 0 : _a.includes("TransientTransactionError")) || attempt === maxRetries - 1) {
                        throw err;
                    }
                }
            }
        }
        finally {
            yield session.endSession();
        }
    });
}
const followOtherUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { userToFollowId } = req.params;
    if (!userToFollowId || !(0, utils_1.isValidObjectId)(userToFollowId)) {
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
            success: false,
            msg: "User to follow ID is required!",
        });
    }
    if (userId === userToFollowId) {
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.CONFLICT,
            success: false,
            msg: "You cannot follow yourself!",
        });
    }
    try {
        yield withTransactionRetry((session) => __awaiter(void 0, void 0, void 0, function* () {
            const [user, userToFollow] = yield Promise.all([
                userModel_1.default.findById(userId).session(session),
                userModel_1.default.findById(userToFollowId).session(session),
            ]);
            if (!user || !userToFollow) {
                throw new Error("User not found");
            }
            if (user.following.some((id) => id.equals(userToFollow._id))) {
                throw new Error("Already following this user");
            }
            user.following.push(userToFollow._id);
            userToFollow.followers.push(user._id);
            yield Promise.all([user.save({ session }), userToFollow.save({ session })]);
            utils_1.logger.info(`User ${userId} followed user ${userToFollowId}`);
            (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.OK,
                success: true,
                msg: "User followed successfully!",
            });
        }));
    }
    catch (error) {
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.followOtherUsers = followOtherUsers;
// Unfollow user controller
const unfollowOtherUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { userToUnfollowId } = req.params;
    if (!userToUnfollowId || !(0, utils_1.isValidObjectId)(userToUnfollowId)) {
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
            success: false,
            msg: "User to unfollow ID is required!",
        });
    }
    if (userId === userToUnfollowId) {
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.CONFLICT,
            success: false,
            msg: "You cannot unfollow yourself!",
        });
    }
    try {
        yield withTransactionRetry((session) => __awaiter(void 0, void 0, void 0, function* () {
            const [user, userToUnfollow] = yield Promise.all([
                userModel_1.default.findById(userId).session(session),
                userModel_1.default.findById(userToUnfollowId).session(session),
            ]);
            if (!user || !userToUnfollow) {
                throw new Error("User not found");
            }
            if (!user.following.some((id) => id.equals(userToUnfollow._id))) {
                throw new Error("You are not following this user");
            }
            user.following = user.following.filter((id) => !id.equals(userToUnfollow._id));
            userToUnfollow.followers = userToUnfollow.followers.filter((id) => !id.equals(user._id));
            yield Promise.all([user.save({ session }), userToUnfollow.save({ session })]);
            utils_1.logger.info(`User ${userId} unfollowed user ${userToUnfollowId}`);
            (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.OK,
                success: true,
                msg: "User unfollowed successfully!",
            });
        }));
    }
    catch (error) {
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.unfollowOtherUsers = unfollowOtherUsers;
