import { StatusCodes } from "http-status-codes";
import { sendError, sendResponse } from "../utils/helperFunction";
import { IAuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import User, { IUser } from "../models/userModel";


// TEST THE CONTROLLER 
export const suggestionForUser = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const user: IUser | null = await User.findById(userId);
        if (!user) {
            sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found !"
            })
        }
        const aggregationPipeline = [
            {
                $match: { _id: userId }
            },
            {
                $lookup: {
                    from: "users",
                    localfield: "following",
                    foreignfield: "_id",
                    as: "followingUsers"
                }
            },
            { $unwind: "followingUsers" },
            {
                $lookup: {
                    from: "users",
                    loaclfield: "followingUsers.following",
                    foreginfield: "_id",
                    as: "secondDegreeConnections"
                }
            },
            { $unwind: "secondDegreeConnections" },
            {
                $match: {
                    "secondDegreeConnections._id": { $nin: [user ? user.following : undefined, userId] }
                }
            },
            { $limit: 5 }
        ]
        const suggestedUsers = await User.aggregate(aggregationPipeline);
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Suggested Users fetched !",
            data: suggestedUsers
        })
    } catch (error) {
        sendError(res, { error });
    }
}