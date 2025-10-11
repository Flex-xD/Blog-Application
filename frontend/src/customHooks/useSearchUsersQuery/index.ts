import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utility/axiosClient";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { apiReponse, errorResponse, IUser } from "@/types";
import { toast } from "sonner";
import { SOCIAL_ENDPOINTS } from "@/constants/constants";

interface SearchUsersResponse {
    users: IUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
        nextPage: number | null;
        prevPage: number | null;
    };
}

interface SearchUsersParams {
    userId: string;
    query: string;
    page?: number;
    limit?: number;
}

const useSearchUsersQuery = ({ userId, query, page = 1, limit = 10 }: SearchUsersParams) => {
    return useQuery<apiReponse<SearchUsersResponse>, errorResponse>({
        queryKey: QUERY_KEYS.USERS.SEARCH(userId, page, limit, query), // Define a SEARCH key in QUERY_KEYS
        queryFn: async () => {
            const response = await apiClient.get<apiReponse<SearchUsersResponse>>(
                `${SOCIAL_ENDPOINTS.SEARCH_USERS}?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                { timeout: 30000 }
            );
            return response.data;
        },
        enabled: !!userId && !!query && query.trim() !== "",
        onSuccess: ({ data: { success: searchSuccess, message: searchMessage } }) => {
            if (searchSuccess) {
                toast.success(searchMessage);
            } else {
                toast.info(searchMessage);
            }
        },
        onError: (error) => {
            toast.error(error.msg || "Failed to fetch search results!");
        },
    });
};

export default useSearchUsersQuery;