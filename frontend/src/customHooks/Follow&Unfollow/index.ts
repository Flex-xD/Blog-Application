import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";


interface ApiResponse {
    statusCode: number,
    success: false,
    msg: string,
}

interface errorResponse {
    statuCode: number,
    success: boolean,
    msg: string
}

const useFollowOrUnfollowMutation = (targetUserId: string, currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (isCurrentlyFollowing: boolean) => {
            const endpoint = isCurrentlyFollowing
                ? SOCIAL_ENDPOINTS.UNFOLLOW_USER(targetUserId) :
                SOCIAL_ENDPOINTS.FOLLOW_USER(targetUserId)
            const response = await apiClient.post<ApiResponse>(endpoint);
            console.log(response.data)
            return response.data;
        },
        onMutate: async (isCurrentlyFollowing: boolean) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId) });

            const previousStatus = queryClient.getQueryData<boolean>(QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId));

            queryClient.setQueryData(
                QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId),
                !isCurrentlyFollowing
            )

            return { previousStatus };
        }
        ,
        onSuccess: (data) => {
            console.log(data.msg)
            queryClient.invalidateQueries()
        },
        onError: (error: errorResponse, _, context) => {
            console.log({ error });
            if (context?.previousStatus !== undefined) {
                queryClient.setQueryData(QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId), context.previousStatus);
                return toast.error(error.msg);

            }
        }
    })
}

export default useFollowOrUnfollowMutation;