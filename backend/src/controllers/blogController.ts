import { Request  , Response } from "express"
import { createApiResponse, sendError, sendResponse } from "../middleware/helperFunction";
import { StatusCodes } from "http-status-codes";
import User, { ZuserSchema, zUserType } from "../models/userModel";
import Blog from "../models/blogModel";
import  z from "zod";
import mongoose, { mongo } from "mongoose";

interface IAuthRequest extends Request {
    userId?:string
}

export const ZBlogSchema = z.object({
    title:z.string()
    .min(10 , "Must be 10 letter long atleat !") , 
    body:z.string() , 
    image:z.string().default("") , 
    author:z.string()
})

export type ZblogType = z.infer<typeof ZBlogSchema>;


interface IBlogRequestBody {
    title:string , 
    image:string ,
    body:string
}

export const createBlogController = async (req:IAuthRequest , res:Response) => {
    try {
        const {title , image , body} = req.body as IBlogRequestBody;
        if (!title || body) {
            sendResponse(res , {statusCode:StatusCodes.BAD_REQUEST , success:false , msg:"Title and Body are required !"})
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = req.userId;
            if (!userId) {
                sendResponse
            }
        } catch (error) {
            
        } finally  {

        }
    } catch (error) {
        sendError(res , {statusCode:500})
    }
}