import { Request, response, Response } from "express"
import { sendError, sendResponse } from "../middleware/helperFunction";
import { StatusCodes } from "http-status-codes";
import User, { IUser, ZuserSchema, zUserType } from "../models/userModel";
import Blog, { IBlog } from "../models/blogModel";
import mongoose from "mongoose";

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
                return  sendResponse(res, {
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
            return   sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, msg: "Blog successfully created !", data: userBlog })
        } catch (error) {
            session.abortTransaction();
            sendError(res, { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error })
        } finally {
            session.endSession();
        }
    } catch (error) {
        sendError(res, { error })
    }
}

export const getUserBlogs = async (req:IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) {
            sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
        }
        const user: IUser | null = await User.findById(userId).populate("userBlogs");
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

        const validUser = safeUser.data;
        return sendResponse(res , {
            statusCode:StatusCodes.OK , 
            success:true , 
            msg:"User Blogs found !" , 
            data:validUser.userBlogs as unknown as IBlog[]
        })
    } catch (error) {
        sendError(res , {error});
    }
}

export const getUserSavedBlogs = async () => {

}

export const getUserFeed = async () => {

}

export const deleteUserBlog = async () => {

}

// * LIKE AND COMMENT AND REPLIES

export const likeOnBlog = async () => {

}

export const commentOnBlog = async () => {

}