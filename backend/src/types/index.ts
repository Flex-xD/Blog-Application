import { Types } from "mongoose";
import { IBlog } from "../models/blogModel";

export type authControllerType = {
    email?: string,
    username?: string,
    password: string
}

// ? BLOG CONTROLLER TYPES 

export interface IFeedQuery {
    page?: string;
    limit?: string;
}

export interface IBlogWithAuthor extends IBlog {
    authorDetails: {
        _id: Types.ObjectId;
        username: string;
        profileImage?: string;
    };
}