import jwt, { decode } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { isValidObjectId } from "../utils";
import mongoose from "mongoose";
import { sendError, sendResponse } from "../utils/helperFunction";

export interface IAuthRequest extends Request {
    userId?: string | null | mongoose.Types.ObjectId;
}

const verifyToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
        const {token} = req.cookies;
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                msg: "Unauthorized access , please try again !"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {userId:string};
        if (!decoded.userId || !isValidObjectId(decoded.userId)) {
            sendResponse(res , {
                statusCode:StatusCodes.UNAUTHORIZED , 
                success:false , 
                msg:"UserId not found !"
            })
        }
        req.userId = decoded.userId;
        next();

    } catch (error) {
        console.log("Token verification failed :", error);
        return sendError(res , {error});
    }
}

export default verifyToken;