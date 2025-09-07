import { StatusCodes } from "http-status-codes";
import { sendError, sendResponse } from "../utils/helperFunction";
import { IAuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import User, { IUser } from "../models/userModel";
import mongoose, { Types } from "mongoose";
import { isValidObjectId, logger } from "../utils"

const suggestionForUser = async (req :IAuthRequest , res:Response) => {
    try {
        
    } catch (error) {
        sendError(res , {error});
    }
}