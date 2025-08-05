import { Response } from "express"

interface ApiResponse<T> {
    statusCode: number,
    success: boolean,
    msg: string,
    data?: T | null
}

export const createApiResponse = <T>({ statusCode, success, msg, data }: { statusCode: number, success: boolean, msg: string, data?: T | null }): ApiResponse<T> => {

    return {
        statusCode,
        success,
        msg,
        data
    }
}



export const sendResponse = <T>(res: Response, { statusCode, success, msg, data }: { statusCode: number, success: boolean, msg: string, data?: T | null }) => {
    return res.status(statusCode).json({statusCode  , success , msg , data});
}


export const sendError = (res: Response, {
    statusCode = 500,
    message = "Something went wrong",
    error,
}: {
    statusCode?: number;
    message?: string;
    error?: unknown;
}) => {
    const errorMessage = error instanceof Error ? error.message : message;
    console.error("❌ Error:", errorMessage);

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message: errorMessage,
        data: null,
    });
};