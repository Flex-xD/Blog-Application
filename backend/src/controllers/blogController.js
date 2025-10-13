"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentOnBlog = exports.unlikeBlog = exports.likeOnBlog = exports.getPopularBlogsController = exports.userFollowingBlogsController = exports.searchBlogsController = exports.unsaveBlogController = exports.saveBlog = exports.getFeedController = exports.deleteUserBlog = exports.getUserSavedBlogs = exports.getUserBlogs = exports.createBlogController = void 0;
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const helperFunction_1 = require("../utils/helperFunction");
const http_status_codes_1 = require("http-status-codes");
const userModel_1 = __importDefault(require("../models/userModel"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const mongoose_1 = __importStar(require("mongoose"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
function uploadBufferToCloudinary(fileBuffer, filename, folder = process.env.CLOUDINARY_FOLDER || "blogs") {
    return new Promise((resolve, reject) => {
        const upload = cloudinary_1.default.uploader.upload_stream({
            folder,
            resource_type: "image",
            filename_override: filename,
            unique_filename: true,
            overwrite: false,
        }, (err, result) => {
            if (err || !result)
                return reject(err || new Error("No result from Cloudinary"));
            resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
            });
        });
        streamifier_1.default.createReadStream(fileBuffer).pipe(upload);
    });
}
const POPULARITY_WEIGHTS = {
    likes: 1,
    comments: 1.5,
};
const createBlogController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return (0, helperFunction_1.sendResponse)(res, { statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST, success: false, msg: "Title and Body are required !" });
        }
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        let uploadedPublicId = null;
        try {
            const { userId } = req;
            if (!userId) {
                return (0, helperFunction_1.sendResponse)(res, { statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" });
            }
            const user = yield userModel_1.default.findById(userId).select("-password");
            if (!user) {
                return (0, helperFunction_1.sendResponse)(res, {
                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "User not found",
                });
            }
            let imageInfo;
            if (req.file && req.file.buffer) {
                const { secure_url, public_id, width, height, format } = yield uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
                uploadedPublicId = public_id;
                imageInfo = {
                    url: secure_url,
                    publicId: public_id,
                    width,
                    height,
                    format,
                };
            }
            const userBlog = new blogModel_1.default({
                title,
                image: imageInfo ? imageInfo : undefined,
                body,
                authorDetails: {
                    username: user.username,
                    _id: user._id,
                    profilePicture: (_a = user.profilePicture) === null || _a === void 0 ? void 0 : _a.url
                }
            });
            yield userBlog.save({ session });
            user.userBlogs.push(userBlog._id);
            yield user.save({ session });
            yield session.commitTransaction();
            console.log("Blog created successfully ! : ", userBlog);
            return (0, helperFunction_1.sendResponse)(res, { statusCode: http_status_codes_1.StatusCodes.CREATED, success: true, msg: "Blog successfully created !", data: userBlog });
        }
        catch (error) {
            session.abortTransaction();
            if (uploadedPublicId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(uploadedPublicId);
                }
                catch (e) {
                    console.error("Failed to clean up Cloudinary asset:", e);
                }
            }
            return (0, helperFunction_1.sendError)(res, { statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, error });
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        return (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.createBlogController = createBlogController;
const getUserBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, { statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" });
        }
        const user = yield userModel_1.default.findById(userId).populate("userBlogs");
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "User Blogs found !",
            data: user.userBlogs
        });
    }
    catch (error) {
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.getUserBlogs = getUserBlogs;
const getUserSavedBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, { statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED, success: false, msg: "You are unauthorized !" });
        }
        const user = yield userModel_1.default.findById(userId).populate("saves");
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        const savedBlogs = user.saves;
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: savedBlogs.length ? "User Blogs found !" : "You haven't saved any blogs yet !",
            data: savedBlogs
        });
    }
    catch (error) {
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.getUserSavedBlogs = getUserSavedBlogs;
const deleteUserBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req;
        const { blogId } = req.params;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!"
            });
        }
        // Find the user and populate their blogs
        const user = yield userModel_1.default.findById(userId).populate("userBlogs");
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        // Check if the blogId exists in the user's userBlogs array
        if (!user.userBlogs.some(blog => blog._id.toString() === blogId)) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.FORBIDDEN,
                success: false,
                msg: "You are not authorized to delete this blog",
            });
        }
        // Find the blog to get its images
        const blog = yield blogModel_1.default.findById(blogId);
        if (!blog) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found",
            });
        }
        // Delete all images from Cloudinary
        if ((_a = blog.image) === null || _a === void 0 ? void 0 : _a.publicId) {
            yield deleteFromCloudinary(blog.image.publicId);
        }
        // Delete the blog from the database
        yield blogModel_1.default.findByIdAndDelete(blogId);
        // Remove the blogId from the user's userBlogs array
        user.userBlogs = user.userBlogs.filter(b => b._id.toString() !== blogId);
        yield user.save();
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Blog deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting user blog:", error);
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.deleteUserBlog = deleteUserBlog;
function deleteFromCloudinary(publicId) {
    return __awaiter(this, void 0, void 0, function* () {
        const cloudinary = require('cloudinary').v2;
        try {
            yield cloudinary.uploader.destroy(publicId);
        }
        catch (error) {
            console.error('Error deleting from Cloudinary:', error);
        }
    });
}
const getFeedController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }
        const user = yield userModel_1.default.findById(userId).select("following");
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        const { page = "1", limit = "10" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }
        const followLimit = Math.ceil(limitNum * 0.3);
        const randomLimit = limitNum - followLimit;
        const following = [
            ...user.following,
            new mongoose_1.Types.ObjectId(userId),
        ];
        const followPipeline = [
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
        const followBlogs = yield blogModel_1.default.aggregate(followPipeline);
        // Get random blogs only if we're on the first page or if follow blogs are less than expected
        let randomBlogs = [];
        if (pageNum === 1 || followBlogs.length < followLimit) {
            const actualRandomLimit = pageNum === 1 ? randomLimit : Math.max(0, limitNum - followBlogs.length);
            if (actualRandomLimit > 0) {
                const randomPipeline = [
                    {
                        $match: {
                            "authorDetails._id": { $nin: following },
                            createdAt: { $lte: new Date() },
                        },
                    },
                    { $sample: { size: actualRandomLimit } },
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
                randomBlogs = yield blogModel_1.default.aggregate(randomPipeline);
            }
        }
        const blogs = [...followBlogs, ...randomBlogs].sort(() => Math.random() - 0.5);
        const totalFollowBlogs = yield blogModel_1.default.countDocuments({
            "authorDetails._id": { $in: following },
            createdAt: { $lte: new Date() },
        });
        const totalPages = Math.ceil(totalFollowBlogs / followLimit);
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
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Feed fetched successfully",
            data: responseData,
        });
    }
    catch (error) {
        return (0, helperFunction_1.sendError)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
});
exports.getFeedController = getFeedController;
const saveBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { blogId } = req.params;
        // Validate user authentication
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }
        // Validate blogId format
        if (!mongoose_1.Types.ObjectId.isValid(blogId)) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid blog ID",
            });
        }
        // Find the user
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        // Check if the blog exists
        const blog = yield blogModel_1.default.findById(blogId);
        if (!blog) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found",
            });
        }
        // Check if the blog is already saved
        if (user.saves.includes(new mongoose_1.Types.ObjectId(blogId))) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.CONFLICT,
                success: false,
                msg: "Blog already saved",
            });
        }
        // Add blog to user's savedBlogs
        user.saves.push(new mongoose_1.Types.ObjectId(blogId));
        yield user.save();
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Blog saved successfully",
            data: {
                blogId,
                savedAt: new Date(),
            },
        });
    }
    catch (error) {
        return (0, helperFunction_1.sendError)(res, {
            error,
        });
    }
});
exports.saveBlog = saveBlog;
const unsaveBlogController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { blogId } = req.params;
        // Validate user authentication
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }
        // Validate blogId format
        if (!mongoose_1.Types.ObjectId.isValid(blogId)) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid blog ID",
            });
        }
        // Find the user
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        // Check if the blog exists
        const blog = yield blogModel_1.default.findById(blogId);
        if (!blog) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found",
            });
        }
        // Check if the blog is saved by the user
        if (!user.saves.includes(new mongoose_1.Types.ObjectId(blogId))) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.CONFLICT,
                success: false,
                msg: "Blog is not saved by this user",
            });
        }
        // Remove blog from user's saves
        user.saves = user.saves.filter((id) => id.toString() !== blogId);
        yield user.save();
        const responseData = {
            blogId,
            unsavedAt: new Date().toISOString(),
        };
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Blog unsaved successfully",
            data: responseData,
        });
    }
    catch (error) {
        return (0, helperFunction_1.sendError)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            error: error.message || "Failed to unsave blog",
        });
    }
});
exports.unsaveBlogController = unsaveBlogController;
const searchBlogsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { query, page = "1", limit = "10" } = req.query;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }
        if (!query || query.trim() === "") {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Search query is required",
            });
        }
        const user = yield userModel_1.default.findById(userId).select("following");
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }
        const followLimit = Math.ceil(limitNum * 0.3);
        const randomLimit = limitNum - followLimit;
        const following = [
            ...user.following,
            new mongoose_1.Types.ObjectId(userId),
        ];
        const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const regexQuery = new RegExp(`\\b${escapedQuery}\\b`, "i");
        const followPipeline = [
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
        const followBlogs = yield blogModel_1.default.aggregate(followPipeline);
        let randomBlogs = [];
        if (pageNum === 1 || followBlogs.length < followLimit) {
            const actualRandomLimit = pageNum === 1 ? randomLimit : Math.max(0, limitNum - followBlogs.length);
            if (actualRandomLimit > 0) {
                const randomPipeline = [
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
                randomBlogs = yield blogModel_1.default.aggregate(randomPipeline);
            }
        }
        const blogs = [...followBlogs, ...randomBlogs];
        const totalFollowBlogs = yield blogModel_1.default.countDocuments({
            "authorDetails._id": { $in: following },
            createdAt: { $lte: new Date() },
            $or: [
                { title: { $regex: regexQuery } },
                { body: { $regex: regexQuery } },
            ],
        });
        const totalPages = Math.ceil(totalFollowBlogs / followLimit);
        if (blogs.length === 0) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.OK,
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
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Search results fetched successfully",
            data: responseData,
        });
    }
    catch (error) {
        console.error("Search Blogs Error:", error);
        return (0, helperFunction_1.sendError)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            error: error.message || "Internal server error",
        });
    }
});
exports.searchBlogsController = searchBlogsController;
const userFollowingBlogsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "You are unauthorized!",
            });
        }
        const user = yield userModel_1.default.findById(userId).select("following");
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found",
            });
        }
        const { page = "1", limit = "10" } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || limitNum < 1) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }
        const following = [
            ...user.following,
        ];
        console.log('Following IDs:', following);
        const followingStrings = following.map(id => id.toString());
        const sampleBlog = yield blogModel_1.default.findOne({ "authorDetails._id": { $in: followingStrings } });
        console.log('Sample blog:', sampleBlog);
        const followPipeline = [
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
        const followBlogs = yield blogModel_1.default.aggregate(followPipeline);
        console.log('Follow blogs:', followBlogs);
        const totalFollowBlogs = yield blogModel_1.default.countDocuments({
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
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Following blogs fetched successfully",
            data: responseData,
        });
    }
    catch (error) {
        console.error('Error in userFollowingBlogsController:', error);
        return (0, helperFunction_1.sendError)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
});
exports.userFollowingBlogsController = userFollowingBlogsController;
const getPopularBlogsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Invalid pagination parameters",
            });
        }
        const popularityPipeline = [
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
        const blogs = yield blogModel_1.default.aggregate(popularityPipeline);
        const totalBlogs = yield blogModel_1.default.countDocuments();
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
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Popular blogs fetched successfully",
            data: responseData,
        });
    }
    catch (error) {
        return (0, helperFunction_1.sendError)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        });
    }
});
exports.getPopularBlogsController = getPopularBlogsController;
const likeOnBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { blogToBeLikedId } = req.params;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (!(0, mongoose_1.isValidObjectId)(blogToBeLikedId))
            if (!blogToBeLikedId) {
                return (0, helperFunction_1.sendResponse)(res, {
                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    success: false,
                    msg: "Blog to be liked ID is not given !"
                });
            }
        const blog = yield Promise.all([
            blogModel_1.default.findById({
                _id: blogToBeLikedId,
                likes: { $nin: userId }
            })
        ]);
        if (!blog) {
            const blogExists = yield blogModel_1.default.exists({ _id: blogToBeLikedId });
            if (!blogExists) {
                return (0, helperFunction_1.sendResponse)(res, {
                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                    success: false,
                    msg: "Blog not found !"
                });
            }
        }
        const updatedBlog = yield blogModel_1.default.findByIdAndUpdate(blogToBeLikedId, {
            $addToSet: { likes: new mongoose_1.default.Types.ObjectId(userId) },
        }, { new: true, runValidators: true });
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: 'Blog liked successfully',
            data: { likesCount: updatedBlog === null || updatedBlog === void 0 ? void 0 : updatedBlog.likes.length },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        (0, helperFunction_1.sendError)(res, { error });
    }
    finally {
        yield session.endSession();
    }
});
exports.likeOnBlog = likeOnBlog;
const unlikeBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { blogToUnlikeId } = req.params;
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const blog = yield blogModel_1.default.findOne({
                _id: blogToUnlikeId,
                likes: userId
            }).session(session);
            if (!blog) {
                const blogExists = yield blogModel_1.default.exists({ _id: blogToUnlikeId });
                if (!blogExists) {
                    return (0, helperFunction_1.sendResponse)(res, {
                        statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                        success: false,
                        msg: "Blog does not exist!"
                    });
                }
                return (0, helperFunction_1.sendResponse)(res, {
                    statusCode: http_status_codes_1.StatusCodes.CONFLICT,
                    success: false,
                    msg: "Blog already unliked"
                });
            }
            const updatedBlog = yield blogModel_1.default.findByIdAndUpdate(blogToUnlikeId, { $pull: { likes: userId } }, { new: true, runValidators: true, session });
            yield session.commitTransaction();
            yield session.endSession();
            (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.OK,
                success: true,
                msg: "Blog unliked successfully!",
                data: { likesCount: updatedBlog === null || updatedBlog === void 0 ? void 0 : updatedBlog.likes.length }
            });
        }
        catch (error) {
            yield session.abortTransaction();
            yield session.endSession();
            return (0, helperFunction_1.sendError)(res, { error });
        }
    }
    catch (error) {
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.unlikeBlog = unlikeBlog;
const commentOnBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId } = req;
        const { blogId } = req.params;
        const { commentBody } = req.body;
        const user = yield userModel_1.default.findById(userId).session(session);
        if (!user) {
            yield session.abortTransaction();
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found !"
            });
        }
        const userComment = {
            commentAuthor: {
                _id: userId,
                profilePicture: ((_a = user.profilePicture) === null || _a === void 0 ? void 0 : _a.url) ? (_b = user === null || user === void 0 ? void 0 : user.profilePicture) === null || _b === void 0 ? void 0 : _b.url : "",
                username: user.username
            },
            body: commentBody,
            date: new Date()
        };
        const blog = yield blogModel_1.default.findByIdAndUpdate(blogId, { $push: { comments: userComment } }, { new: true, session });
        if (!blog) {
            yield session.abortTransaction();
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "Blog not found !"
            });
        }
        yield session.commitTransaction();
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.CREATED,
            success: true,
            data: userComment,
            msg: "Comment posted successfully !"
        });
    }
    catch (error) {
        yield session.abortTransaction();
        return (0, helperFunction_1.sendError)(res, { error });
    }
    finally {
        yield session.endSession();
    }
});
exports.commentOnBlog = commentOnBlog;
