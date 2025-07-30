import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export interface IAuthRequest extends Request {
    userId?: string | null;
}

const verifyToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                msg: "Unauthorized access , please try again !"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {userId:string};
        req.userId = decoded.userId;
        next();

    } catch (error) {
        console.log("Token verification failed :", error);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            msg: "Unauthorized access , please try again !"
        })
    }
}

export default verifyToken;