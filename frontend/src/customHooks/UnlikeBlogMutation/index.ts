import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiResponse } from "../Follow&Unfollow";
import type { errorResponse } from "@/types";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";


const useUnLikeMutation = (userId:string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (targetBlogId: string) => {
            const endpoint = SOCIAL_ENDPOINTS.UNLIKE_BLOG(targetBlogId);
            const response = await apiClient.post<ApiResponse>(endpoint);
            return response.data
        },
        onMutate: async (targetBlogId:string) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LIKES.PERSONAL_LIKES(userId , targetBlogId) });
            const previousStatus = queryClient.getQueryData<boolean>(QUERY_KEYS.LIKES.PERSONAL_LIKES(userId , targetBlogId));
            queryClient.setQueryData(QUERY_KEYS.LIKES.ALL, !previousStatus);
            return { previousStatus  , targetBlogId};
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
        onSettled: async (_data , _error , targetBlogId , _context) => {
            queryClient.invalidateQueries({queryKey:QUERY_KEYS.LIKES.PERSONAL_LIKES(userId , targetBlogId)})
        },
    })
}

export default useUnLikeMutation;