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
        const response = await User.findById(userId).populate("userBlogs").populate("following followers") as IUser;

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

export const followOtherUsers = async (req: IAuthRequest, res: Response) => {
    try {
        const session = await mongoose.startSession();
        const { userId } = req;
        const { userToFollowId } = req.params;
        try {
            session.startTransaction();
            if (!userToFollowId || !isValidObjectId(userToFollowId)) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "User to be unfollow ID is required !"
                })
            }
            if (userId === userToFollowId) {
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    msg: "You cannot unfollow yourself !"
                })
            }

            const [user, userToFollow] = await Promise.all([
                await User.findById(userId).session(session) as IUser,
                await User.findById(userToFollowId).session(session) as IUser,
            ])

            if (!user || !userToFollow) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: 'User not found',
                });
            }

            if (
                user.following.includes(new Types.ObjectId(userToFollowId)) ||
                userId && userToFollow.followers.includes(new Types.ObjectId(userId))
            ) {
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    msg: 'Already following this user',
                });
            }
            user.following.push(userToFollowId as unknown as mongoose.Types.ObjectId);
            userToFollow.followers.push(userId as unknown as mongoose.Types.ObjectId);
            await Promise.all([
                user.save({ session }),
                userToFollow.save({ session })
            ])
            await session.commitTransaction();
            logger.info(`User ${userId} followed user ${userToFollowId}`);
            sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: "User followed Successfully !"
            })
        } catch (error) {
            await session.abortTransaction();
            return sendError(res, { error })
        } finally {
            await session.endSession()
        }
    } catch (error) {
        return sendError(res, { error });
    }
}

export const unfollowOtherUsers = async (req: IAuthRequest, res: Response) => {
    try {
        const session = await mongoose.startSession();
        const { userId } = req;
        const { userToUnfollowId } = req.params;

        try {
            session.startTransaction();
            if (!userToUnfollowId || !isValidObjectId(userToUnfollowId)) {
                await session.abortTransaction();
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: 'User to unfollow ID is required or invalid!',
                });
            }

            if (userId === userToUnfollowId) {
                await session.abortTransaction();
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    msg: 'You cannot unfollow yourself!',
                });
            }

            const [user, userToUnfollow] = await Promise.all([
                User.findById(userId).session(session) as Promise<IUser>,
                User.findById(userToUnfollowId).session(session) as Promise<IUser>,
            ]);

            if (!user || !userToUnfollow) {
                await session.abortTransaction();
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: 'User not found',
                });
            }

            if (
                !user.following.includes(new Types.ObjectId(userToUnfollowId)) ||
                !userToUnfollow.followers.includes(new Types.ObjectId(userId as unknown as string))
            ) {
                await session.abortTransaction();
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    msg: 'You are not following this user',
                });
            }

            user.following = user.following.filter(
                (id) => !id.equals(new Types.ObjectId(userToUnfollowId))
            );

            userToUnfollow.followers = userToUnfollow.followers.filter(
                (id) => !id.equals(new Types.ObjectId(userId as unknown as string))
            );

            await Promise.all([
                user.save({ session }),
                userToUnfollow.save({ session }),
            ]);

            await session.commitTransaction();
            logger.info(`User ${userId} unfollowed user ${userToUnfollowId}`);
            sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: 'User unfollowed successfully!',
            });
        } catch (error) {
            await session.abortTransaction();
            return sendError(res, { error });
        } finally {
            await session.endSession();
        }
    } catch (error) {
        return sendError(res, { error });
    }
};

export const saveBlog = async (req: IAuthRequest, res: Response) => {
    try {

    } catch (error) {
        sendError(res, { error })
    }

}

