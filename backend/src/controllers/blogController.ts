import { Request, Response } from "express"
import { sendError, sendResponse } from "../utils/helperFunction";
import { StatusCodes } from "http-status-codes";
import User, { IUser } from "../models/userModel";
import Blog, { IBlog } from "../models/blogModel";
import mongoose, { isValidObjectId, ObjectId, PipelineStage, Types } from "mongoose";
import { IFeedQuery } from "../types";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

function uploadBufferToCloudinary(
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
                    profilePicture: user.profilePicture
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
                    "authorDetails._id": { $in: following },
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
        const followBlogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(
            followPipeline,
        );
        console.log(followBlogs);

        const randomPipeline: PipelineStage[] = [
            {
                $match: {
                    "authorDetails._id": { $nin: following },
                    createdAt: { $lte: new Date() },
                },
            },
            { $sample: { size: randomLimit } },
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
        const randomBlogs: IBlogWithAuthor[] = await Blog.aggregate<IBlogWithAuthor>(
            randomPipeline,
        );

        console.log("Random Blogs : ", randomBlogs)

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

// * LIKE AND COMMENT AND REPLIES

export const likeOnBlog = async (req: IAuthRequest, res: Response) => {
    const { userId } = req;
    const { blogToBeLikedId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!isValidObjectId(blogToBeLikedId))
            if (!blogToBeLikedId) {
                sendResponse(res, {
                    statusCode: StatusCodes.BAD_REQUEST,
                    success: false,
                    msg: "Blog to be liked ID not given !"
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
                sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "Blog not found !"
                })
            }
            sendResponse(res, {
                statusCode: StatusCodes.CONFLICT,
                success: false,
                msg: "Blog already Liked !"
            })
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogToBeLikedId, {
            $addToSet: { likes: new mongoose.Types.ObjectId(blogToBeLikedId) },
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
        const session = await mongoose.startSession()
        session.startTransaction();
        try {
            const blog = await Promise.all([
                Blog.findById({
                    _id: blogToUnlikeId,
                    likes: { $in: userId }
                }).session(session)
            ])

            if (!blog) {
                const blogExists = await Blog.exists({
                    _id: blogToUnlikeId
                })
                if (!blogExists) {
                    return sendResponse(res, {
                        statusCode: StatusCodes.NOT_FOUND,
                        success: false,
                        msg: "Blog does not exists !"
                    })
                }
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    msg: "Blog already Liked"
                })
            }
            const updatedBlog = await Blog.findByIdAndUpdate(blogToUnlikeId, {
                likes: { $pull: userId }
            }, { new: true, runValidators: true }
            )
            sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: false,
                msg: "Blog unliked successfully !",
                data: { likesCount: updatedBlog?.likes.length },

            })
        } catch (error) {
            return sendError(res, { error });
        } finally {
            await session.endSession();
        }
    } catch (error) {
        sendError(res, { error });
    }
}

export const commentOnBlog = async () => {
}