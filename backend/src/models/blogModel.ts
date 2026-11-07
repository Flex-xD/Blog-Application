import mongoose, { Document, Schema, Types } from "mongoose";

export interface IImageInfo {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
}

export type TUserComment = {
    commentAuthor: {
        _id: Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    body: string;
    date: Date;
};

export interface IBlog extends Document {
    _id: Types.ObjectId;
    title: string;
    body: string;
    image?: IImageInfo;
    authorDetails: {
        username: string;
        profilePicture: string;
        _id: Types.ObjectId;
    };
    likes: Types.ObjectId[];
    comments: TUserComment[];
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<TUserComment>(
    {
        commentAuthor: {
            _id: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            username: {
                type: String,
                required: true,
            },
            profilePicture: {
                type: String,
                default: "",
            },
        },
        body: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

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
            publicId: { type: String },
            width: { type: Number },
            height: { type: Number },
            format: { type: String },
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: {
            type: [commentSchema],
            default: [],
        },
        authorDetails: {
            username: {
                type: String,
            },
            profilePicture: {
                type: String,
            },
            _id: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;