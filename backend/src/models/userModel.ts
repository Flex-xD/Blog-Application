import mongoose, { Schema, Document, Types, Model } from 'mongoose'
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string
    email: string
    password: string
    profilePicture:string
    followers: Types.ObjectId[]
    following: Types.ObjectId[]
    saves: Types.ObjectId[]     
    blogs: Types.ObjectId[]     
    createdAt?: Date
    updatedAt?: Date
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
        profilePicture : {
            type:String , 
        } ,
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        saves: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Blog',
            },
        ],
        blogs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Blog',
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

const User:Model<IUser> = mongoose.model('User', UserSchema);
export default User;
