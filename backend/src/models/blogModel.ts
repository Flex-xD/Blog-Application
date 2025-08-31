import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";

export interface IBlog extends Document {
    _id: ObjectId
    title: string;
    body: string;
    image: string;
    authorDetails:{
        username:string , 
        profilePicture:string , 
        _id:mongoose.ObjectId
    }
    likes: Types.ObjectId[];
    comments: Types.ObjectId[];
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
        comments: [
            {
                ref: "User",
                type: Schema.Types.ObjectId,
            },
        ],
        authorDetails: {
            username:{
                type:String ,
            } , 
            profilePicture:{
                type:String , 
            } , 
            _id:{
                type:String
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
