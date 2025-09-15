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