export interface IUser {
    username: string;
    email: string;
    password: string;
    bio: string,
    profilePicture?: string;
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
    image: string;
    author: string
    likes: string[];
    comments: string[];
    createdAt?: Date;
    updatedAt?: Date;
}