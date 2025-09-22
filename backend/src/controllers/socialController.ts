import { StatusCodes } from "http-status-codes";
import { sendError, sendResponse } from "../utils/helperFunction";
import { IAuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import User, { IUser } from "../models/userModel";
import mongoose from "mongoose";


// TEST THE CONTROLLER 
export const followSuggestionForUser = async (req: IAuthRequest, res: Response) => {
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
        const mutualSuggestionAggregationPipeline = [
            {
                $match: { _id: userId }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "following",
                    foreignField: "_id",
                    as: "followingUsers"
                }
            },
            { $unwind: "$followingUsers" },
            {
                $lookup: {
                    from: "users",
                    localField: "followingUsers.following",
                    foreignField: "_id",
                    as: "secondDegreeConnections"
                }
            },
            { $unwind: "$secondDegreeConnections" },
            {
                $match: {
                    "secondDegreeConnections._id": {
                        $nin: [...(user?.following || []), userId] // safe fallback
                    }
                }
            },
            { $limit: 5 }
        ];

        const randomAggregationPipeline = [
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(userId as string) ,
                        $nin:[...(user?.following || [])]
                    },
                    
                }
            },
            {
                $lookup: {
                    from: "blogs",
                    localField: "userBlogs",
                    foreignField: "_id",
                    as: "userBlogs"
                }
            },
            { $sample: { size: 10 } }
        ]

        const [mutualFollowSuggestions, randomFollowSuggestions] = await Promise.all([
            User.aggregate(mutualSuggestionAggregationPipeline),
            User.aggregate(randomAggregationPipeline)
        ])

        const suggestedUsers = [...mutualFollowSuggestions, ...randomFollowSuggestions];

        // * THINK WHAT KIND OF RESPOSE YOU WANT TO SEND TO THE FRONTEND TO DISPLAY DATA AND THEN SEND THE REQUIRED FIELDS AND NOT THE WHOLE DOCUMENT

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