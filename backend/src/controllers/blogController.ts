import { Request, response, Response } from "express"
import { sendError, sendResponse } from "../middleware/helperFunction";
import { StatusCodes } from "http-status-codes";
import User, { IUser, ZuserSchema, zUserType } from "../models/userModel";
import Blog, { IBlog } from "../models/blogModel";
import mongoose from "mongoose";
import { success } from "zod";

interface IAuthRequest extends Request {
    userId?: string
}

interface IBlogRequestBody {
    title: string,
    image: string,
    body: string
}

export const createBlogController = async (req: IAuthRequest, res: Response) => {
    try {
        const { title, image, body } = req.body as IBlogRequestBody;
        if (!title || !body) {
            return sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, msg: "Title and Body are required !" })
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { userId } = req;
            if (!userId) {
                return sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
            }
            const user: IUser | null = await User.findById(userId);
            if (!user) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "User not found",
                });
            }
            const safeUser = ZuserSchema.safeParse({
                ...user.toObject(),
                _id: (user._id as mongoose.Types.ObjectId).toString()
            });
            if (!safeUser.success) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    msg: "Invalid user data",
                    data: safeUser.error.issues,
                });
            }
            const userBlog = new Blog({
                title,
                image,
                body,
                author: userId
            })

            await userBlog.save({ session });
            user.userBlogs.push(userBlog._id as unknown as mongoose.Types.ObjectId);
            await user.save({ session });
            await session.commitTransaction();
            return sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, msg: "Blog successfully created !", data: userBlog })
        } catch (error) {
            session.abortTransaction();
            return sendError(res, { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error })
        } finally {
            session.endSession();
        }
    } catch (error) {
        return sendError(res, { error })
    }
}

export const getUserBlogs = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) {
            return sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
        }
        const user: IUser | null = await User.findById(userId).populate("userBlogs");
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "User Blogs found !",
            data: user.userBlogs as unknown as IBlog[]
        })
    } catch (error) {
        sendError(res, { error });
    }
}

export const getUserSavedBlogs = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) {
            return sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
        }
        const user: IUser | null = await User.findById(userId).populate("userBlogs");
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }

        const savedBlogs = user.saves as unknown as IBlog[]
        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: savedBlogs.length ? "User Blogs found !" : "You haven't saved any blogs yet !",
            data: savedBlogs
        })
    } catch (error) {
        sendError(res, { error });
    }
}

export const getUserFeed = async (req: IAuthRequest, res: Response) => {
    try {
        // * GET USER FEED
        // ? Check wheter user is there or not 
        const { userId } = req;
        if (!userId) {
            return sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
        }
        const user: IUser | null = await User.findById(userId).populate("userBlogs");
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }

        if (user.following.length) {
            return sendResponse(res , {
                statusCode:StatusCodes.LENGTH_REQUIRED , 
                success:false , 
                msg:"User don't have any following !" , 
            })
        }
        for (let i = 0 ; i < user.following.length ; i++) {
            const userFollowing : IUser | null = await User.findById(i);
            userFollowing?.userBlogs
        }
        user.following
        // ? Now Check if User's following have uploaded , something ( let followingUploaded )
        // ? If followingUploaded true and user havn't seen them then show followings blogs and 
        // ? and then show the latest blogs all over 
        // ? If followingUploaded false , just show the latest blogs 
    } catch (error) {
        sendError(res, { error });
    }
}

export const deleteUserBlog = async () => {

}

// * LIKE AND COMMENT AND REPLIES

export const likeOnBlog = async () => {

}

export const commentOnBlog = async () => {

}