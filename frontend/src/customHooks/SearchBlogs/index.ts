import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import apiClient from "@/utility/axiosClient";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { BLOG_ENDPOINTS } from "@/constants/constants";
import type { apiReponse, errorResponse, IBlog } from "@/types";
import { toast } from "sonner";

interface SearchBlogsResponse {
    blogs: IBlog[];
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

interface SearchBlogsParams {
    userId: string;
    query: string;
    page?: number;
    limit?: number;
}

const useSearchBlogsQuery = ({ userId, query, page = 1, limit = 10 }: SearchBlogsParams) => {
    return useQuery<apiReponse<SearchBlogsResponse>, errorResponse, apiReponse<SearchBlogsResponse>, readonly unknown[]>({
        queryKey: QUERY_KEYS.BLOGS.FEED(userId, page, limit, query),
        queryFn: async () => {
            const response = await apiClient.get<apiReponse<SearchBlogsResponse>>(
                `${BLOG_ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                { timeout: 30000 }
            );
            return response.data;
        },
        enabled: !!userId && !!query && query.trim() !== "",
        onSuccess: ({ data }: { data: { success: boolean; message: string } }) => {
            const { success: searchSuccess, message: searchMessage } = data;

            if (searchSuccess) {
                toast.success(searchMessage);
            } else {
                toast.info(searchMessage);
            }
        },

        onError: (error: { msg: any; }) => {
            toast.error(error.msg || "Failed to fetch search results!");
        },
    } as UseQueryOptions<apiReponse<SearchBlogsResponse>, errorResponse>);
};

export default useSearchBlogsQuery;