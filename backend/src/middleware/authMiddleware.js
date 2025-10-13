"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const utils_1 = require("../utils");
const helperFunction_1 = require("../utils/helperFunction");
const verifyToken = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                msg: "Unauthorized access , please try again !"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId || !(0, utils_1.isValidObjectId)(decoded.userId)) {
            (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                success: false,
                msg: "UserId not found !"
            });
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log("Token verification failed :", error);
        return (0, helperFunction_1.sendError)(res, { error });
    }
};
exports.default = verifyToken;
