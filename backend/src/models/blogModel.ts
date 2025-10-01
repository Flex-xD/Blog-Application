import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";
import { number, string } from "zod";
import { required } from "zod/v4/core/util.cjs";

export interface IImageInfo {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
}

export type TUserComment = {
    commentAuthor: {
        _id: Types.ObjectId,
        username: string,
        profilePicture: string
    },
    body: string,
    date: Date
}

export interface IBlog extends Document {
    _id: ObjectId
    title: string;
    body: string;
    image?: IImageInfo;
    authorDetails: {
        username: string,
        profilePicture: string,
        _id: mongoose.ObjectId
    }
    likes: Types.ObjectId[];
    comments: TUserComment[];
    createdAt: Date;
    updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: true,
            minLength: 10,
        },
        body: {
            type: String,
            required: false,
        },
        image: {
            url: { type: String },
            publicId: {
                type: String,
            },
            width: { type: Number },
            height: { type: Number },
            format: { type: String },
        },
        likes: [
            {
                ref: "User",
                type: Schema.Types.ObjectId,
            },
        ],
        comments: [{
            commentAuthor: {
                _id: Types.ObjectId,
                username: string,
                profilePicture: string
            },
            body: string,
            date: Date
        }],
        authorDetails: {
            username: {
                type: String,
            },
            profilePicture: {
                type: String,
            },
            _id: {
                type: String
            }
        },
        createdAt: {
            type: Date
        },
        updatedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;
