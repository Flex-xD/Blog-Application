import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ApiResponse {
    statusCode: number;
    success: boolean;
    msg: string;
}

export interface ErrorResponse {
    statusCode: number;
    success: boolean;
    msg: string;
}

interface MutationParams {
    targetUserId: string;
    currentUserId: string;
    isCurrentlyFollowing: boolean;
}

const useFollowOrUnfollowMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // 👇 IDs are passed dynamically per call
        mutationFn: async ({ targetUserId, currentUserId, isCurrentlyFollowing }: MutationParams) => {
            const endpoint = isCurrentlyFollowing
                ? SOCIAL_ENDPOINTS.UNFOLLOW_USER(targetUserId)
                : SOCIAL_ENDPOINTS.FOLLOW_USER(targetUserId);

            console.log("Target User ID:", targetUserId);
            console.log("Endpoint:", endpoint);

            // ✅ send currentUserId in body
            const response = await apiClient.post<ApiResponse>(endpoint, { currentUserId });
            return response.data;
        },

        // 🧠 Optimistic update
        onMutate: async ({ targetUserId, isCurrentlyFollowing }) => {
            await queryClient.cancelQueries({
                queryKey: QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId),
            });

            const previousStatus = queryClient.getQueryData<boolean>(
                QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId)
            );

            queryClient.setQueryData(
                QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId),
                !isCurrentlyFollowing
            );

            return { previousStatus, targetUserId };
        },

        // 🟢 Success feedback
        onSuccess: (data) => {
            toast.success(data.msg);
            console.log("✅ Follow/Unfollow Success:", data.msg);
        },

        // 🔴 Rollback on error
        onError: (error: ErrorResponse, _, context) => {
            console.error("❌ Follow/Unfollow failed:", error);
            if (context?.previousStatus !== undefined && context?.targetUserId) {
                queryClient.setQueryData(
                    QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(context.targetUserId),
                    context.previousStatus
                );
            }
            toast.error(error.msg || "Something went wrong");
        },

        // ♻️ Revalidate relevant queries
        onSettled: async (_data, _error, variables) => {
            if (!variables) return;
            const { targetUserId, currentUserId } = variables;

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.SOCIAL.FOLLOWING_STATUS(targetUserId),
                }),
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.SOCIAL.SUGGESTIONS(currentUserId),
                }),
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.PROFILE.FOLLOWERS(targetUserId),
                }),
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.PROFILE.FOLLOWING(currentUserId),
                }),
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.PROFILE.ME,
                }),
            ]);
        },
    });
};

export default useFollowOrUnfollowMutation;
