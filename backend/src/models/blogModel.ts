import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBlog extends Document {
    title: string;
    body?: string;
    image?: string;
    likes: Types.ObjectId[];       
    comment: Types.ObjectId[];
    author: Types.ObjectId;        
    createdAt?: Date;
    updatedAt?: Date;
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
            type: String,
            required: false,
            default: "",
        },
        likes: [
            {
                ref: "User",
                type: Schema.Types.ObjectId,
            },
        ],
        comment: [
            {
                ref: "User",
                type: Schema.Types.ObjectId,
            },
        ],
        author: {
            ref: "User",
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;
