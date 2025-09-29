import type { Variants } from "framer-motion";

export interface IUser {
    username: string;
    email: string;
    password: string;
    _id: string,
    bio: string,
    profilePicture?: {
        format: string,
        height: number,
        width: number,
        url: string,
        publicId: string
    };
    followers: string[];
    following: string[];
    saves: string[];
    userBlogs: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IBlog {
    _id: string
    title: string;
    body: string;
    image: {
        format: string,
        height: number,
        width: number,
        url: string,
        publicId: string
    };
    authorDetails: {
        username: string,
        _id: string,
        profilePicture: string
    };
    likes: string[];
    comments: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface apiReponse<T> {
    statusCode: number,
    success: boolean,
    data?: T,
    msg: string
}

export interface errorResponse {
    statusCode: number,
    success: boolean,
    msg: string
}

interface ITransition {
    type?: "tween" | "spring" | "keyframes";
    duration?: number;
    ease?: string | number[];
}

interface IModalVariant {
    opacity: number;
    scale: number;
    transition: ITransition;
}

export interface IModalVariants {
    open: IModalVariant;
    closed: IModalVariant;
}

// ✅ Now define variants with `satisfies Variants`
export const modalVariants = {
    open: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "tween",
            duration: 0.2,
            ease: "easeInOut",
        },
    },
    closed: {
        opacity: 0,
        scale: 0.9,
        transition: {
            type: "tween",
            duration: 0.15,
            ease: "easeInOut",
        },
    },
} satisfies Variants;