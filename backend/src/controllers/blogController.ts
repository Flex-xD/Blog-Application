import { Request, Response } from "express"
import { sendError, sendResponse } from "../utils/helperFunction";
import { StatusCodes } from "http-status-codes";
import User, { IUser } from "../models/userModel";
import Blog, { IBlog, TUserComment } from "../models/blogModel";
import mongoose, { isValidObjectId, ObjectId, PipelineStage, Types } from "mongoose";
import { IFeedQuery } from "../types";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";
import { logger } from "../utils";


export function uploadBufferToCloudinary(
    fileBuffer: Buffer,
    filename?: string,
    folder = process.env.CLOUDINARY_FOLDER || "blogs"
): Promise<{
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    format?: string;
}> {
    return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                filename_override: filename,
                unique_filename: true,
                overwrite: false,
            },
            (err, result) => {
                if (err || !result) return reject(err || new Error("No result from Cloudinary"));
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                });
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(upload);
    });
}

const POPULARITY_WEIGHTS = {
    likes: 1,
    comments: 1.5,
};

interface IBlogWithAuthor {
    _id: mongoose.Types.ObjectId;
    title: string;
    image: string;
    body: string;
    createdAt: Date;
    likes: any[];
    comments: any[];
    authorDetails: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture?: string;
    };
}

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
        const { title, body } = req.body as IBlogRequestBody;
        if (!title || !body) {
            return sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, msg: "Title and Body are required !" })
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        let uploadedPublicId: null | string = null;
        try {
            const { userId } = req;
            if (!userId) {
                return sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" })
            }
            const user: IUser | null = await User.findById(userId).select("-password");
            if (!user) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "User not found",
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
            }
            const userBlog = new Blog({
                title,
                image: imageInfo ? imageInfo : undefined,
                body,
                authorDetails: {
                    username: user.username,
                    _id: user._id,
                    profilePicture: user.profilePicture?.url
                }
            })

            await userBlog.save({ session });
            user.userBlogs.push(userBlog._id as unknown as mongoose.Types.ObjectId);
            await user.save({ session });
            await session.commitTransaction();
            console.log("Blog created successfully ! : ", userBlog);
            return sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, msg: "Blog successfully created !", data: userBlog })
        } catch (error) {
            session.abortTransaction();
            if (uploadedPublicId) {
                try {
                    await cloudinary.uploader.destroy(uploadedPublicId);
                } catch (e) {
                    console.error("Failed to clean up Cloudinary asset:", e);
                }
            }
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
        const user: IUser | null = await User.findById(userId).populate("saves");
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

export const deleteUserBlog = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { blogId } = req.params;

        if (!userId) {
            return sendResponse(res, {
                statusCode: StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!"
            });
        }

        // Find the user and populate their blogs
        const user: IUser | null = await User.findById(userId).populate("userBlogs");
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }

        // Check if the blogId exists in the user's userBlogs array
        if (!user.userBlogs.some(blog => blog._id.toString() === blogId)) {
            return sendResponse(res, {
                statusCode: StatusCodes.FORBIDDEN,
                success: false,
                msg: "You are not authorized to delete this blog",
            });
        }

        // Find the blog to get its images
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found",
            });
        }

        // Delete all images from Cloudinary
        if (blog.image?.publicId) {
            await deleteFromCloudinary(blog.image.publicId);
        }

        // Delete the blog from the database
        await Blog.findByIdAndDelete(blogId);

        // Remove the blogId from the user's userBlogs array
        user.userBlogs = user.userBlogs.filter(b => b._id.toString() !== blogId);
        await user.save();

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Blog deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting user blog:", error);
        sendError(res, { error });
    }
};

async function deleteFromCloudinary(publicId: string) {
    const cloudinary = require('cloudinary').v2;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
}

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

        const { page = "1", limit = "10" } = req.query as { page?: string; limit?: string };
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

        const followingIds = [...user.following.map(id => new Types.ObjectId(id)), new Types.ObjectId(userId)];
        const followLimit = Math.ceil(limitNum * 0.3);

        let followBlogs: IBlogWithAuthor[] = [];

        if (followingIds.length > 0) {
            const followPipeline: PipelineStage[] = [
                {
                    $match: {
                        "authorDetails._id": { $in: followingIds },
                        createdAt: { $lte: new Date() },
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pageNum - 1) * followLimit },
                { $limit: followLimit },
                {
                    $project: {
                        title: 1,
                        image: 1,
                        body: 1,
                        createdAt: 1,
                        likes: 1,
                        comments: 1,
                        "authorDetails._id": 1,
                        "authorDetails.username": 1,
                        "authorDetails.profilePicture": 1,
                    },
                },
            ];

            followBlogs = await Blog.aggregate<IBlogWithAuthor>(followPipeline);
        }

        const neededRandom = limitNum - followBlogs.length;
        let randomBlogs: IBlogWithAuthor[] = [];

        if (neededRandom > 0) {
            const randomPipeline: PipelineStage[] = [
                {
                    $match: {
                        "authorDetails._id": { $nin: followingIds },
                        createdAt: { $lte: new Date() },
                    },
                },
                { $sample: { size: neededRandom } },
                {
                    $project: {
                        title: 1,
                        image: 1,
                        body: 1,
                        createdAt: 1,
                        likes: 1,
                        comments: 1,
                        "authorDetails._id": 1,
                        "authorDetails.username": 1,
                        "authorDetails.profilePicture": 1,
                    },
                },
            ];

            randomBlogs = await Blog.aggregate<IBlogWithAuthor>(randomPipeline);
        }

        const blogs = [...followBlogs, ...randomBlogs].sort(() => Math.random() - 0.5);

        const totalFollowBlogs = await Blog.countDocuments({
            "authorDetails._id": { $in: followingIds },
            createdAt: { $lte: new Date() },
        });

        const totalPages = Math.max(1, Math.ceil(totalFollowBlogs / limitNum));

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Feed fetched successfully",
            data: {
                blogs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalFollowBlogs,
                    totalPages,
                    hasMore: pageNum < totalPages,
                    nextPage: pageNum < totalPages ? pageNum + 1 : null,
                    prevPage: pageNum > 1 ? pageNum - 1 : null,
                },
            },
        });
    } catch (error) {
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
};



export const saveBlog = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { blogId } = req.params;

        // Validate user authentication
        if (!userId) {
            return sendResponse(res, {
                statusCode: StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }

        // Validate blogId format
        if (!Types.ObjectId.isValid(blogId)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid blog ID",
            });
        }

        // Find the user
        const user = await User.findById(userId)
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found",
            });
        }

        // Check if the blog is already saved
        if (user.saves.includes(new Types.ObjectId(blogId))) {
            return sendResponse(res, {
                statusCode: StatusCodes.CONFLICT,
                success: false,
                msg: "Blog already saved",
            });
        }

        // Add blog to user's savedBlogs
        user.saves.push(new Types.ObjectId(blogId));
        await user.save();

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Blog saved successfully",
            data: {
                blogId,
                savedAt: new Date(),
            },
        });
    } catch (error) {
        return sendError(res, {
            error,
        });
    }
};
interface UnsaveBlogResponse {
    blogId: string;
    unsavedAt: string;
}

export const unsaveBlogController = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { blogId } = req.params;

        // Validate user authentication
        if (!userId) {
            return sendResponse(res, {
                statusCode: StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }

        // Validate blogId format
        if (!Types.ObjectId.isValid(blogId)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid blog ID",
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found",
            });
        }

        // Check if the blog is saved by the user
        if (!user.saves.includes(new Types.ObjectId(blogId))) {
            return sendResponse(res, {
                statusCode: StatusCodes.CONFLICT,
                success: false,
                msg: "Blog is not saved by this user",
            });
        }

        // Remove blog from user's saves
        user.saves = user.saves.filter((id) => id.toString() !== blogId);
        await user.save();

        const responseData: UnsaveBlogResponse = {
            blogId,
            unsavedAt: new Date().toISOString(),
        };

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Blog unsaved successfully",
            data: responseData,
        });
    } catch (error: any) {
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error: error.message || "Failed to unsave blog",
        });
    }
};

export const searchBlogsController = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { query, page = "1", limit = "10" } = req.query as IFeedQuery & { query?: string };

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

        const user: IUser | null = await User.findById(userId).select("following");
        if (!user) {
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
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

        const followLimit = Math.ceil(limitNum * 0.3);
        const randomLimit = limitNum - followLimit;
        const following: Types.ObjectId[] = [
            ...user.following,
            new Types.ObjectId(userId),
        ];

        const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const regexQuery = new RegExp(`\\b${escapedQuery}\\b`, "i");

        const followPipeline: PipelineStage[] = [
            {
                $match: {
                    "authorDetails._id": { $in: following },
                    createdAt: { $lte: new Date() },
                    $or: [
                        { title: { $regex: regexQuery } },
                        { body: { $regex: regexQuery } },
                    ],
                },
            },
            {
                $addFields: {
                    sortPriority: {
                        $cond: [{ $regexMatch: { input: "$title", regex: regexQuery } }, 1, 2],
                    },
                },
            },
            { $sort: { sortPriority: 1, createdAt: -1 } },
            { $skip: (pageNum - 1) * followLimit },
            { $limit: followLimit },
            {
                $project: {
                    title: 1,
                    image: 1,
                    body: 1,
                    createdAt: 1,
                    likes: 1,
                    comments: 1,
                    "authorDetails._id": 1,
                    "authorDetails.username": 1,
                    "authorDetails.profilePicture": 1,
                },
            },
        ];
        const followBlogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(followPipeline);

        let randomBlogs: IBlogWithAuthor[] = [];
        if (pageNum === 1 || followBlogs.length < followLimit) {
            const actualRandomLimit = pageNum === 1 ? randomLimit : Math.max(0, limitNum - followBlogs.length);

            if (actualRandomLimit > 0) {
                const randomPipeline: PipelineStage[] = [
                    {
                        $match: {
                            "authorDetails._id": { $nin: following },
                            createdAt: { $lte: new Date() },
                            $or: [
                                { title: { $regex: regexQuery } },
                                { body: { $regex: regexQuery } },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            sortPriority: {
                                $cond: [{ $regexMatch: { input: "$title", regex: regexQuery } }, 1, 2],
                            },
                        },
                    },
                    { $sort: { sortPriority: 1, createdAt: -1 } },
                    { $skip: (pageNum - 1) * actualRandomLimit },
                    { $limit: actualRandomLimit },
                    {
                        $project: {
                            title: 1,
                            image: 1,
                            body: 1,
                            createdAt: 1,
                            likes: 1,
                            comments: 1,
                            "authorDetails._id": 1,
                            "authorDetails.username": 1,
                            "authorDetails.profilePicture": 1,
                        },
                    },
                ];
                randomBlogs = await Blog.aggregate<IBlogWithAuthor>(randomPipeline);
            }
        }

        const blogs = [...followBlogs, ...randomBlogs];

        const totalFollowBlogs = await Blog.countDocuments({
            "authorDetails._id": { $in: following },
            createdAt: { $lte: new Date() },
            $or: [
                { title: { $regex: regexQuery } },
                { body: { $regex: regexQuery } },
            ],
        });

        const totalPages = Math.ceil(totalFollowBlogs / followLimit);

        if (blogs.length === 0) {
            return sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: "No blogs found",
                data: {
                    blogs: [],
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
            blogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalFollowBlogs,
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
        console.error("Search Blogs Error:", error);
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error: error.message || "Internal server error",
        });
    }
};

export const userFollowingBlogsController = async (req: IAuthRequest, res: Response) => {
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
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || limitNum < 1) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }

        const following: Types.ObjectId[] = [
            ...user.following,
        ];
        console.log('Following IDs:', following);

        const followingStrings = following.map(id => id.toString());

        const sampleBlog = await Blog.findOne({ "authorDetails._id": { $in: followingStrings } });
        console.log('Sample blog:', sampleBlog);

        const followPipeline: PipelineStage[] = [
            {
                $match: {
                    "authorDetails._id": { $in: followingStrings },
                    createdAt: { $lte: new Date() },
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
                $project: {
                    title: 1,
                    image: { $ifNull: ["$image", null] },
                    body: 1,
                    createdAt: 1,
                    likes: 1,
                    comments: 1,
                    "authorDetails._id": 1,
                    "authorDetails.username": 1,
                    "authorDetails.profilePicture": 1,
                },
            },
        ];
        const followBlogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(followPipeline);
        console.log('Follow blogs:', followBlogs);

        const totalFollowBlogs = await Blog.countDocuments({
            "authorDetails._id": { $in: followingStrings },
            createdAt: { $lte: new Date() },
        });
        console.log('Total follow blogs:', totalFollowBlogs);

        const totalPages = Math.ceil(totalFollowBlogs / limitNum);

        const responseData = {
            blogs: followBlogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalFollowBlogs,
                totalPages,
                hasMore: pageNum < totalPages,
                nextPage: pageNum < totalPages ? pageNum + 1 : null,
                prevPage: pageNum > 1 ? pageNum - 1 : null,
            },
        };

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Following blogs fetched successfully",
            data: responseData,
        });
    } catch (error) {
        console.error('Error in userFollowingBlogsController:', error);
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
};
export const getPopularBlogsController = async (req: IAuthRequest, res: Response) => {
    try {
        const { page = "1", limit = "10" } = req.query as { page?: string; limit?: string };
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }

        const popularityPipeline: PipelineStage[] = [
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                },
            },
            {
                $addFields: {
                    popularityScore: {
                        $add: [
                            { $multiply: ["$likesCount", POPULARITY_WEIGHTS.likes] },
                            { $multiply: ["$commentsCount", POPULARITY_WEIGHTS.comments] },
                        ],
                    },
                },
            },
            { $sort: { popularityScore: -1, createdAt: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
                $project: {
                    title: 1,
                    body: 1,
                    image: { $ifNull: ["$image", { url: null, format: null, width: null, height: null }] },
                    createdAt: 1,
                    likes: 1,
                    comments: 1,
                    popularityScore: 1,
                    "authorDetails._id": 1,
                    "authorDetails.username": 1,
                    "authorDetails.profilePicture": 1,
                },
            }
        ];

        const blogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(popularityPipeline);

        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limitNum);

        const responseData = {
            blogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalBlogs,
                totalPages,
                hasMore: pageNum < totalPages,
                nextPage: pageNum < totalPages ? pageNum + 1 : null,
                prevPage: pageNum > 1 ? pageNum - 1 : null,
            },
        };

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "Popular blogs fetched successfully",
            data: responseData,
        });
    } catch (error) {
        return sendError(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
};

export const likeOnBlog = async (req: IAuthRequest, res: Response) => {
    const { userId } = req;
    const { blogToBeLikedId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!isValidObjectId(blogToBeLikedId))
            if (!blogToBeLikedId) {
                return sendResponse(res, {
                    statusCode: StatusCodes.BAD_REQUEST,
                    success: false,
                    msg: "Blog to be liked ID is not given !"
                })
            }
        const blog = await Promise.all([
            Blog.findById({
                _id: blogToBeLikedId,
                likes: { $nin: userId }
            })
        ])

        if (!blog) {
            const blogExists = await Blog.exists({ _id: blogToBeLikedId });
            if (!blogExists) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "Blog not found !"
                })
            }
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogToBeLikedId, {
            $addToSet: { likes: new mongoose.Types.ObjectId(userId) },
        },
            { new: true, runValidators: true }
        )
        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: 'Blog liked successfully',
            data: { likesCount: updatedBlog?.likes.length },
        });
    } catch (error) {
        await session.abortTransaction();
        sendError(res, { error });
    } finally {
        await session.endSession();
    }
}

export const unlikeBlog = async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { blogToUnlikeId } = req.params;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const blog = await Blog.findOne({
                _id: blogToUnlikeId,
                likes: userId
            }).session(session);

            if (!blog) {
                const blogExists = await Blog.exists({ _id: blogToUnlikeId });
                if (!blogExists) {
                    return sendResponse(res, {
                        statusCode: StatusCodes.NOT_FOUND,
                        success: false,
                        msg: "Blog does not exist!"
                    });
                }

                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    msg: "Blog already unliked"
                });
            }

            const updatedBlog = await Blog.findByIdAndUpdate(
                blogToUnlikeId,
                { $pull: { likes: userId } },
                { new: true, runValidators: true, session }
            );

            await session.commitTransaction();
            await session.endSession();

            sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                msg: "Blog unliked successfully!",
                data: { likesCount: updatedBlog?.likes.length }
            });

        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            return sendError(res, { error });
        }
    } catch (error) {
        sendError(res, { error });
    }
};

export const commentOnBlog = async (req: IAuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req;
        const { blogId } = req.params;
        const { commentBody }: { commentBody: string } = req.body;
        const user = await User.findById(userId).session(session)
        if (!user) {
            await session.abortTransaction()
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found !"
            })
        }
        const userComment: TUserComment = {
            commentAuthor: {
                _id: userId as unknown as mongoose.Types.ObjectId,
                profilePicture: user.profilePicture?.url ? user?.profilePicture?.url : "",
                username: user.username
            },
            body: commentBody,
            date: new Date()
        }
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $push: { comments: userComment } },
            { new: true, session }
        )
        if (!blog) {
            await session.abortTransaction()
            return sendResponse(res, {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found !"
            })
        }
        await session.commitTransaction()
        return sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            data: userComment,
            msg: "Comment posted successfully !"
        })
    } catch (error) {
        await session.abortTransaction();
        return sendError(res, { error });
    } finally {
        await session.endSession()
    }
}