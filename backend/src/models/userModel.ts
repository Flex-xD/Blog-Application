import mongoose, { Schema, Document, Types, Model } from 'mongoose'
import bcrypt from 'bcryptjs';
import z from "zod";

const zMongooseObjectId = z.string()
    .length(24)
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

export const ZuserSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string().min(6 , "password length should be atleast 6 character !"),
    profilePicture: z.string().optional(),
    followers: z.array(zMongooseObjectId),
    following: z.array(zMongooseObjectId),
    saves:z.array(zMongooseObjectId) , 
    userBlogs:z.array(zMongooseObjectId) , 
    createdAt:z.date().optional() , 
    updatedAt:z.date().optional()
})

export type zUserType = z.infer<typeof ZuserSchema>;


const UserSchema = new Schema<zUserType>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePicture: {
            type: String,
        },
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User' , 
                default:[],
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default:[]
            },
        ],
        saves: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Blog',
                default:[]
            },
        ],
        userBlogs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Blog',
                default:[]
            },
        ],
    },
    { timestamps: true }
)


UserSchema.pre("save", async function (next) {
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const User: Model<zUserType> = mongoose.model('User', UserSchema);
export default User;
