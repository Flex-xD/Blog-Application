export const createApiResponse = <T>({
    statusCode,
    message,
    data = null,
    success = true,
    error = null,
}: {
    statusCode: number;
    message: string;
    data?: T | null;
    success?: boolean;
    error?: Error | null;
}) => {
    if (error) {
        console.error("Error occurred:", error.message);
        return {
            statusCode,
            success: false,
            message: error.message,
            data: null,
        };
    }

    return {
        statusCode,
        success,
        message,
        data,
    };
};
