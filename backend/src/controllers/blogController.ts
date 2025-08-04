import { Request, Response } from "express"
import { createApiResponse, sendError, sendResponse } from "../middleware/helperFunction";
import { OK, StatusCodes } from "http-status-codes";
import User, { ZuserSchema, zUserType } from "../models/userModel";
import Blog from "../models/blogModel";
import z, { success } from "zod";
import mongoose, { mongo } from "mongoose";

interface IAuthRequest extends Request {
    userId?: string
}

export const ZBlogSchema = z.object({
    title: z.string()
        .min(10, "Must be 10 letter long atleat !"),
    body: z.string(),
    image: z.string().default(""),
    author: z.string()
})

export type ZblogType = z.infer<typeof ZBlogSchema>;


interface IBlogRequestBody {
    title: string,
    image: string,
    body: string
}

export const createBlogController = async (req: IAuthRequest, res: Response) => {
    try {
        const { title, image, body } = req.body as IBlogRequestBody;
        if (!title || !body) {
            sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, msg: "Title and Body are required !" })
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = req.userId;
            if (!userId) {
                sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
            }
            const user = await User.findById(userId);
            if (!user) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "User not found",
                });
            }
            const safeUser = ZuserSchema.safeParse(user);
            if (!safeUser.success) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    msg: "Invalid user data",
                    data: safeUser.error.message, 
                });
            }

            const validUser = safeUser.data;

            const userBlog = new Blog({
                title , 
                image , 
                body , 
                author:userId
            })

            await userBlog.save({session});
            validUser.userBlogs.push(userBlog._id as string);
            await user.save({session});
            sendResponse(res , {statusCode:StatusCodes.CREATED , success:true , msg:"Blog successfully created !" , data:userBlog})
        } catch (error) {
            session.abortTransaction();
            sendError(res , {statusCode:StatusCodes.INTERNAL_SERVER_ERROR , error})
        } finally {
            session.endSession();
        }
    } catch (error) {
        sendError(res, { statusCode: 500 })
    }
}