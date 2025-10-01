import mongoose, { Schema, Document, Types, Model } from 'mongoose'
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: string
    username: string;
    email: string;
    password: string;
    bio: string,
    profilePicture?: {
        url: string;
        publicId: string;
        width?: number;
        height?: number;
        format?: string;
    };
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
    saves: Types.ObjectId[];
    userBlogs: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
            url: { type: String },
            publicId: {
                type: String,
            },
            width: { type: Number },
            height: { type: Number },
            format: { type: String },
        },
        bio: {
            type: String,
            default: function (this: IUser) {
                return `Hey, I am ${this.username ?? ''}`;
            }
        },
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: [],
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: []
            },
        ],
        saves: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Blog',
                default: []
            },
        ],
        userBlogs: [
            {
                type: Types.ObjectId,
                ref: 'Blog',
                default: []
            },
        ],
        createdAt: {
            type: Date
        },
        updatedAt: {
            type: Date
        }
    },
    { timestamps: true }
)


UserSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const User: Model<IUser> = mongoose.model('User', UserSchema);
export default User;
