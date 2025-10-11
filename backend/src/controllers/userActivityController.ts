import { StatusCodes } from "http-status-codes";
import { sendError, sendResponse } from "../utils/helperFunction";
import { IAuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import User, { IUser } from "../models/userModel";
import mongoose, { Types } from "mongoose";
import { isValidObjectId, logger } from "../utils";


export const getUserInfo = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const response = await User.findById(userId).populate("userBlogs").populate("saves").populate("following followers") as IUser;

        if (!response) return sendResponse(res, {
            statusCode: StatusCodes.BAD_REQUEST,
            success: false,
            msg: "There was an issue fetching user data !"
        })
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "User data fetched successfully !",
            data: response
        })
    } catch (error) {
        console.log({ error });
        return sendError(res, { error });
    }
}

async function withTransactionRetry(fn: (session: mongoose.ClientSession) => Promise<any>, maxRetries = 3) {
    const session = await mongoose.startSession();
    try {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                session.startTransaction();
                const result = await fn(session);
                await session.commitTransaction();
                return result;
            } catch (err: any) {
                await session.abortTransaction();
                // Only retry for transient errors
                if (!err.errorLabels?.includes("TransientTransactionError") || attempt === maxRetries - 1) {
                    throw err;
                }
            }
        }
    } finally {
        await session.endSession();
    }
}

export const followOtherUsers = async (req: IAuthRequest, res: Response) => {
    const { userId } = req;
    const { userToFollowId } = req.params;

    if (!userToFollowId || !isValidObjectId(userToFollowId)) {
        return sendResponse(res, {
            statusCode: StatusCodes.NOT_FOUND,
            success: false,
            msg: "User to follow ID is required!",
        });
    }

    if (userId === userToFollowId) {
        return sendResponse(res, {
            statusCode: StatusCodes.CONFLICT,
            success: false,
            msg: "You cannot follow yourself!",
        });
    }

    try {
        await withTransactionRetry(async (session) => {
            const [user, userToFollow] = await Promise.all([
                User.findById(userId).session(session),
                User.findById(userToFollowId).session(session),
            ]);

            if (!user || !userToFollow) {
                throw new Error("User not found");
            }

            if (user.following.some((id) => id.equals(userToFollow._id))) {
                throw new Error("Already following this user");
            }

            user.following.push(userToFollow._id as unknown as mongoose.Types.ObjectId);
            userToFollow.followers.push(user._id as unknown as mongoose.Types.ObjectId);

            await Promise.all([user.save({ session }), userToFollow.save({ session })]);

            logger.info(`User ${userId} followed user ${userToFollowId}`);
            sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: "User followed successfully!",
            });
        });
    } catch (error: any) {
        sendError(res, { error });
    }
};

// Unfollow user controller
export const unfollowOtherUsers = async (req: IAuthRequest, res: Response) => {
    const { userId } = req;
    const { userToUnfollowId } = req.params;

    if (!userToUnfollowId || !isValidObjectId(userToUnfollowId)) {
        return sendResponse(res, {
            statusCode: StatusCodes.NOT_FOUND,
            success: false,
            msg: "User to unfollow ID is required!",
        });
    }

    if (userId === userToUnfollowId) {
        return sendResponse(res, {
            statusCode: StatusCodes.CONFLICT,
            success: false,
            msg: "You cannot unfollow yourself!",
        });
    }

    try {
        await withTransactionRetry(async (session) => {
            const [user, userToUnfollow] = await Promise.all([
                User.findById(userId).session(session),
                User.findById(userToUnfollowId).session(session),
            ]);

            if (!user || !userToUnfollow) {
                throw new Error("User not found");
            }

            if (!user.following.some((id) => id.equals(userToUnfollow._id))) {
                throw new Error("You are not following this user");
            }

            user.following = user.following.filter((id) => !id.equals(userToUnfollow._id));
            userToUnfollow.followers = userToUnfollow.followers.filter((id) => !id.equals(user._id));

            await Promise.all([user.save({ session }), userToUnfollow.save({ session })]);

            logger.info(`User ${userId} unfollowed user ${userToUnfollowId}`);
            sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: "User unfollowed successfully!",
            });
        });
    } catch (error: any) {
        sendError(res, { error });
    }
};



