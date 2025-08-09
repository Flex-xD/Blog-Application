import { Request, response, Response } from "express"
import { sendError, sendResponse } from "../middleware/helperFunction";
import { StatusCodes } from "http-status-codes";
import User, { IUser, ZuserSchema, zUserType } from "../models/userModel";
import Blog, { IBlog } from "../models/blogModel";
import mongoose, { PipelineStage, Types } from "mongoose";
import { success } from "zod";
import { IBlogWithAuthor, IFeedQuery } from "../types";

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

// ? I still have to test the getFeedController
export const getFeedController = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) {
            return sendResponse(res, {
                statusCode: StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }
        const user: IUser | null = await User.findById(userId).select("following");
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }

        const { page = "1", limit = "10" } = req.query as IFeedQuery;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }

        const followLimit = Math.ceil(limitNum * 0.4);
        const randomLimit = limitNum - followLimit;

        const following: Types.ObjectId[] = [
            ...user.following,
            new Types.ObjectId(userId),
        ];

        const followPipeline: PipelineStage[] = [
            {
                $match: {
                    author: { $in: following },
                    createdAt: { $lte: new Date() },
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pageNum - 1) * followLimit },
            { $limit: followLimit },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails",
                },
            },
            { $unwind: "$authorDetails" },
            {
                $project: {
                    title: 1,
                    image: 1,
                    body: 1,
                    createdAt: 1,
                    "authorDetails._id": 1,
                    "authorDetails.username": 1,
                    "authorDetails.profileImage": 1,
                },
            },
        ];

        const followBlogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(
            followPipeline,
        );

        const randomPipeline: PipelineStage[] = [
            {
                $match: {
                    author: { $nin: following },
                    createdAt: { $lte: new Date() },
                },
            },
            { $sample: { size: randomLimit } },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails",
                },
            },
            { $unwind: "$authorDetails" },
            {
                $project: {
                    title: 1,
                    image: 1,
                    body: 1,
                    createdAt: 1,
                    "authorDetails._id": 1,
                    "authorDetails.username": 1,
                    "authorDetails.profileImage": 1,
                },
            },
        ];

        const randomBlogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(
            randomPipeline,
        );

        const blogs = [...followBlogs, ...randomBlogs].sort(
            () => Math.random() - 0.5,
        );

        const totalFollowBlogs = await Blog.countDocuments({
            author: { $in: following },
            createdAt: { $lte: new Date() },
        });

        const responseData = {
            blogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalFollowBlogs,
                hasMore: pageNum * followLimit < totalFollowBlogs,
            },
        };

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Feed fetched successfully",
            data: responseData,
        });
    } catch (error) {
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
};


export const deleteUserBlog = async (req: IAuthRequest, res: Response) => {
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
        
    } catch (error) {
        sendError(res, { error });
    }
}

// * LIKE AND COMMENT AND REPLIES

export const likeOnBlog = async () => {

}

export const commentOnBlog = async () => {

}