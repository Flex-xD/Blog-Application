"use strict";
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
exports.logoutController = exports.loginController = exports.registerController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const http_status_codes_1 = require("http-status-codes");
const helperFunction_1 = require("../utils/helperFunction");
const maxage = 3 * 24 * 60 * 60 * 1000;
const createtoken = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    return jsonwebtoken_1.default.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: maxage });
});
const registerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Please fill in all the fields !" });
        }
        const existingUser = yield userModel_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Email already exists!" });
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Username already taken!" });
            }
        }
        const usernameRegex = /^[a-z_.]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Username can only contain lowercase letters, underscores (_), and dots (.)" });
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
        if (!passwordRegex.test(password)) {
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Password must contain at least one letter and one number !"
            });
        }
        const user = yield userModel_1.default.create({
            email,
            username,
            password,
            profilePicture: {
                url: "",
                width: 0,
                height: 0,
                publicId: "",
                format: ""
            },
            following: [],
            followers: [],
            bio: "",
            saves: [],
            userBlogs: [],
        });
        const token = yield createtoken(user._id, user.email);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: maxage,
            sameSite: "strict",
            secure: false
        });
        console.log("User Registered !");
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.CREATED,
            success: true,
            msg: "User Registered !",
            data: user
        });
    }
    catch (error) {
        console.log(error);
        return (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.registerController = registerController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, username } = req.body;
        if ((!email && !username) || !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Please fill in all the fields!" });
        }
        const user = yield userModel_1.default.findOne({ $or: [{ email }, { username }] });
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "User does not exist !" });
        }
        const match = yield bcryptjs_1.default.compare(password, user.password);
        console.log(user.password);
        console.log(match);
        if (!match) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Invalid credentials !" });
        }
        if (req.cookies.token) {
            res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
        }
        const token = yield createtoken(user._id, user.email);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: maxage,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            msg: "User logged In !",
            data: user
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal Server Error !" });
    }
});
exports.loginController = loginController;
const logoutController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
        return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "User Logged Out !" });
    }
    catch (error) {
        console.log({ error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal Server Error !" });
    }
});
exports.logoutController = logoutController;
