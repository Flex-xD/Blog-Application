import { StatusCodes } from "http-status-codes";
import { sendError, sendResponse } from "../utils/helperFunction";
import { IAuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import User, { IUser } from "../models/userModel";
import mongoose from "mongoose";
import { uploadBufferToCloudinary } from "./blogController";

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
                    _id: {
                        $ne: new mongoose.Types.ObjectId(userId as string),
                        $nin: [...(user?.following || [])]
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

export const followPopularUsersSuggestion = async (req:IAuthRequest , res:Response) => {
}

export const updateProfilePicture = async (req: IAuthRequest, res: Response) => {
    let uploadedPublicId: null | string = null;
    try {
        const { userId } = req;
        if (!userId) {
            return sendResponse(res, {
                statusCode: StatusCodes.UNAUTHORIZED,
                success: false,
                msg: 'You are unauthorized!',
            });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: 'User not found',
            });
        }

        let imageInfo: {
            url: string;
            publicId: string;
            width?: number;
            height?: number;
            format?: string;
        } | undefined;

        if (req.file && req.file.buffer) {
            if (user.profilePicture?.publicId) {
                await deleteFromCloudinary(user.profilePicture.publicId);
            }

            const { secure_url, public_id, width, height, format } = await uploadBufferToCloudinary(
                req.file.buffer,
                req.file.originalname
            );
            uploadedPublicId = public_id;
            imageInfo = {
                url: secure_url,
                publicId: public_id,
                width,
                height,
                format,
            };

            user.profilePicture = imageInfo;
            await user.save();
        }
        console.log("Profile picture upated successfully : " , imageInfo);
        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: 'Profile picture updated successfully',
            data: {
                profilePicture: imageInfo,
            },
        });
    } catch (error) {
        // Clean up uploaded file if error occurs
        if (uploadedPublicId) {
            await deleteFromCloudinary(uploadedPublicId);
        }
        console.error('Error updating profile picture:', error);
        return sendResponse(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            msg: 'Error updating profile picture',
        });
    }
}
    ;

async function deleteFromCloudinary(publicId: string) {
    const cloudinary = require('cloudinary').v2;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
}