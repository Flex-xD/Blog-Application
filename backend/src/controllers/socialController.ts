import { StatusCodes } from "http-status-codes";
import { sendError, sendResponse } from "../utils/helperFunction";
import { IAuthRequest } from "../middleware/authMiddleware";
import { NextFunction, Response } from "express";
import User, { IUser } from "../models/userModel";
import mongoose, { Types } from "mongoose";
import { uploadBufferToCloudinary } from "./blogController";
import Blog, { IBlog } from "../models/blogModel";
import axios, { AxiosError } from "axios";
import { logger } from "../utils";

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

export const followPopularUsersSuggestion = async (req: IAuthRequest, res: Response) => {
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
        console.log("Profile picture upated successfully : ", imageInfo);
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

    interface TrendingTopic {
        name: string;
        postCount: number;
    }

    interface OpenRouterResponse {
        choices: Array<{
            message: {
                content: string;
            };
        }>;
    }
}

interface TrendingTopic {
    name: string;
    postCount: number;
}

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}



export const llmTrendingTopics = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const blogs: IBlog[] = await Blog.find().select("title body").lean();

        if (!blogs?.length) {
            logger.warn("No blogs found for trending topics analysis");
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                msg: "No blogs available for analysis",
                success: false,
            });
        }

        // Combine all blog content into one string
        const combinedText = blogs
            .map((blog) => `${blog.title ?? ""} ${blog.body ?? ""}`.trim())
            .filter(Boolean)
            .join("\n\n");

        // Truncate if too long (avoid token limits)
        const maxContentLength = 50000;
        const truncatedText =
            combinedText.length > maxContentLength
                ? combinedText.slice(0, maxContentLength)
                : combinedText;

        // Build prompt for AI
        const prompt = `
      You are an AI assistant tasked with identifying trending topics from blog content.
      Analyze the content below and extract the top 10 trending topics (words or short phrases).
      For each topic, include the approximate number of blogs it appears in.
      Return ONLY a JSON array in this exact format, without markdown or extra text:
      [
        { "name": "topic1", "postCount": 5 },
        { "name": "topic2", "postCount": 4 }
      ]
      Content to analyze:
      ${truncatedText}
    `;

        // Call OpenRouter / OpenAI API
        const response = await axios.post<OpenRouterResponse>(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000, // 15 seconds
            }
        );

        // Ensure valid response
        const aiContent = response.data?.choices?.[0]?.message?.content;
        if (!aiContent) throw new Error("No content returned from AI service");

        logger.debug("Raw AI response content:", { aiContent });

        // Parse AI response
        let trendingTopics: TrendingTopic[] = [];
        try {
            let cleanContent = aiContent.replace(/```json\n?|```/g, "").trim();
            trendingTopics = JSON.parse(cleanContent);

            if (!Array.isArray(trendingTopics)) {
                throw new Error("Parsed AI response is not an array");
            }
        } catch (parseError) {
            logger.error("Failed to parse AI response", { aiContent, parseError });
            throw new Error("Failed to parse AI response as JSON");
        }

        // Validate topic objects
        const validTopics = trendingTopics.filter(
            (topic): topic is TrendingTopic =>
                topic &&
                typeof topic.name === "string" &&
                typeof topic.postCount === "number"
        );

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            msg: "Trending topics fetched successfully",
            data: validTopics,
            success: true,
        });
    } catch (error) {
        logger.error("Error in llmTrendingTopics controller", {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });

        const statusCode = error instanceof AxiosError ? StatusCodes.BAD_GATEWAY : StatusCodes.INTERNAL_SERVER_ERROR;

        return sendError(res, {
            statusCode,
            error
        });
    }
};

export const searchUsersController = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { query, page = "1", limit = "10" } = req.query as { query?: string; page?: string; limit?: string };

        if (!userId) {
            return sendResponse(res, {
                statusCode: StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }

        if (!query || query.trim() === "") {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Search query is required",
            });
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }

        // Escape special characters in query for regex
        const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const regexQuery = new RegExp(escapedQuery, "i"); // Case-insensitive search

        // Search users by username or email
        const userPipeline = [
            {
                $match: {
                    $or: [{ username: { $regex: regexQuery } }, { email: { $regex: regexQuery } }],
                    _id: { $ne: new Types.ObjectId(userId) }, // Exclude current user
                },
            },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
                $project: {
                    username: 1,
                    email: 1,
                    profilePicture: 1,
                    followers: 1,
                    following: 1,
                    userBlogs: 1,
                },
            },
        ];

        const users = await User.aggregate(userPipeline);

        // Count total matching users for pagination
        const totalUsers = await User.countDocuments({
            $or: [{ username: { $regex: regexQuery } }, { email: { $regex: regexQuery } }],
            _id: { $ne: new Types.ObjectId(userId) },
        });

        const totalPages = Math.ceil(totalUsers / limitNum);

        if (users.length === 0) {
            return sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: "No users found",
                data: {
                    users: [],
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total: 0,
                        totalPages: 0,
                        hasMore: false,
                        nextPage: null,
                        prevPage: null,
                    },
                },
            });
        }

        const responseData = {
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalUsers,
                totalPages,
                hasMore: pageNum < totalPages,
                nextPage: pageNum < totalPages ? pageNum + 1 : null,
                prevPage: pageNum > 1 ? pageNum - 1 : null,
            },
        };

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Search results fetched successfully",
            data: responseData,
        });
    } catch (error: any) {
        console.error("Search Users Error:", error);
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error: error.message || "Internal server error",
        });
    }
}
