import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/userModel";
import { StatusCodes } from "http-status-codes";
import { authControllerType } from "../types/index.js";
import { sendError, sendResponse } from "../utils/helperFunction";

const maxage = 3 * 24 * 60 * 60 * 1000;
const createtoken = async (userId: string, email: string) => {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET as string, { expiresIn: maxage });
}

export const registerController = async (req: Request, res: Response) => {
    try {

        const { email, username, password } = req.body as authControllerType;
        if (!email || !username || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please fill in all the fields !" });
        }
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Email already exists!" });
            } else {
                return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Username already taken!" });
            }
        }
        const usernameRegex = /^[a-z_.]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Username can only contain lowercase letters, underscores (_), and dots (.)" });
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
        if (!passwordRegex.test(password)) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                msg: "Password must contain at least one letter and one number !"
            })
        }

        const user: IUser = await User.create({
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
        const token = await createtoken(user._id as string, user.email);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: maxage,
            sameSite: "none",
            secure: true
        });
        console.log("User Registered !");
        return sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            msg: "User Registered !",
            data: user
        })
    } catch (error) {
        console.log(error);
        return sendError(res, { error });
    }
}

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body as authControllerType;
        if ((!email && !username) || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please fill in all the fields!" })
        }
        const user: IUser | null = await User.findOne({ $or: [{ email }, { username }] });
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "User does not exist !" });
        }
        const match = await bcrypt.compare(password, user.password);
        console.log(user.password)
        console.log(match);
        if (!match) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid credentials !" });
        }
        if (req.cookies.token) {
            res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" })
        }
        const token = await createtoken(user._id as string, user.email);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: maxage,               
            sameSite: "none",            
            secure: true                 
        });
        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            msg: "User logged In !",
            data: user
        })
    } catch (error) {

        console.log({ error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal Server Error !" });
    }
}

export const logoutController = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
        return res.status(StatusCodes.OK).json({ msg: "User Logged Out !" });
    } catch (error) {
        console.log({ error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal Server Error !" });
    }
}

