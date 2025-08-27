import axios from "axios";

const getErrorMessage = (error: unknown): string => {
    console.log({ error });
    if (axios.isAxiosError(error)) {
        return error.response?.data?.msg || error.message || "Request failed";
    }
    if (error instanceof Error) return error.message;
    return "Unknown error";
};

export default getErrorMessage;