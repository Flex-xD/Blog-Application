import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiResponse } from "../Follow&Unfollow";
import type { errorResponse } from "@/types";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";


const useLikeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (targetBlogId: string) => {
            const endpoint = SOCIAL_ENDPOINTS.LIKE_BLOG(targetBlogId);
            const response = await apiClient.post<ApiResponse>(endpoint);
            return response.data
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIKES.ALL });
            const previousStatus = queryClient.getQueryData<boolean>(QUERY_KEYS.LIKES.ALL)
            queryClient.setQueryData(QUERY_KEYS.LIKES.ALL, !previousStatus);
            return { previousStatus };
        },
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error: errorResponse, _, context) => {
            console.log({ error });
            if (context?.previousStatus !== undefined) {
                queryClient.setQueryData(QUERY_KEYS.LIKES.ALL, context.previousStatus);
                return toast.error(error.msg);

            }
        },
        onSettled: async () => {
            queryClient.invalidateQueries({queryKey:QUERY_KEYS.LIKES.ALL});
        },
    })
}

export default useLikeMutation;