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
exports.searchUsersController = exports.updateProfilePicture = exports.followPopularUsersSuggestion = exports.followSuggestionForUser = void 0;
const http_status_codes_1 = require("http-status-codes");
const helperFunction_1 = require("../utils/helperFunction");
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importStar(require("mongoose"));
const blogController_1 = require("./blogController");
const followSuggestionForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: "User not found !"
            });
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
                        $nin: [...((user === null || user === void 0 ? void 0 : user.following) || []), userId] // safe fallback
                    }
                }
            },
            { $limit: 5 }
        ];
        const randomAggregationPipeline = [
            {
                $match: {
                    _id: {
                        $ne: new mongoose_1.default.Types.ObjectId(userId),
                        $nin: [...((user === null || user === void 0 ? void 0 : user.following) || [])]
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
        ];
        const [mutualFollowSuggestions, randomFollowSuggestions] = yield Promise.all([
            userModel_1.default.aggregate(mutualSuggestionAggregationPipeline),
            userModel_1.default.aggregate(randomAggregationPipeline)
        ]);
        const suggestedUsers = [...mutualFollowSuggestions, ...randomFollowSuggestions];
        // * THINK WHAT KIND OF RESPOSE YOU WANT TO SEND TO THE FRONTEND TO DISPLAY DATA AND THEN SEND THE REQUIRED FIELDS AND NOT THE WHOLE DOCUMENT
        (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Suggested Users fetched !",
            data: suggestedUsers
        });
    }
    catch (error) {
        (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.followSuggestionForUser = followSuggestionForUser;
const followPopularUsersSuggestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.followPopularUsersSuggestion = followPopularUsersSuggestion;
const updateProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let uploadedPublicId = null;
    try {
        const { userId } = req;
        if (!userId) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: 'You are unauthorized!',
            });
        }
        const user = yield userModel_1.default.findById(userId).select('-password');
        if (!user) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                msg: 'User not found',
            });
        }
        let imageInfo;
        if (req.file && req.file.buffer) {
            if ((_a = user.profilePicture) === null || _a === void 0 ? void 0 : _a.publicId) {
                yield deleteFromCloudinary(user.profilePicture.publicId);
            }
            const { secure_url, public_id, width, height, format } = yield (0, blogController_1.uploadBufferToCloudinary)(req.file.buffer, req.file.originalname);
            uploadedPublicId = public_id;
            imageInfo = {
                url: secure_url,
                publicId: public_id,
                width,
                height,
                format,
            };
            user.profilePicture = imageInfo;
            yield user.save();
        }
        console.log("Profile picture upated successfully : ", imageInfo);
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: 'Profile picture updated successfully',
            data: {
                profilePicture: imageInfo,
            },
        });
    }
    catch (error) {
        // Clean up uploaded file if error occurs
        if (uploadedPublicId) {
            yield deleteFromCloudinary(uploadedPublicId);
        }
        console.error('Error updating profile picture:', error);
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            msg: 'Error updating profile picture',
        });
    }
});
exports.updateProfilePicture = updateProfilePicture;
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
const searchUsersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
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
                    _id: { $ne: new mongoose_1.Types.ObjectId(userId) }, // Exclude current user
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
        const users = yield userModel_1.default.aggregate(userPipeline);
        // Count total matching users for pagination
        const totalUsers = yield userModel_1.default.countDocuments({
            $or: [{ username: { $regex: regexQuery } }, { email: { $regex: regexQuery } }],
            _id: { $ne: new mongoose_1.Types.ObjectId(userId) },
        });
        const totalPages = Math.ceil(totalUsers / limitNum);
        if (users.length === 0) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.OK,
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
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "Search results fetched successfully",
            data: responseData,
        });
    }
    catch (error) {
        console.error("Search Users Error:", error);
        return (0, helperFunction_1.sendError)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            error: error.message || "Internal server error",
        });
    }
});
exports.searchUsersController = searchUsersController;
