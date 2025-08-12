export interface IUser {
    username: string;
    email: string;
    password: string;
    profilePicture?: string;
    followers: string[];
    following:string[];
    saves: string[];
    userBlogs: string[];
    createdAt: Date;
    updatedAt: Date;
}