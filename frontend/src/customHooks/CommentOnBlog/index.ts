import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { apiReponse, errorResponse, TUserComment } from "@/types";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/queryKeys";

interface CommentVariables {
    commentBody: string;
}

const useCommentMutation = (
    blogId: string,
    currentUser: { username: string; profilePicture?: string  , _id:string}
) => {
    const queryClient = useQueryClient();

    return useMutation<apiReponse<TUserComment>, errorResponse, CommentVariables>({
        mutationFn: async (variables) => {
            const response = await apiClient.post<apiReponse<TUserComment>>(
                SOCIAL_ENDPOINTS.COMMENT_BLOG(blogId),
                { commentBody: variables.commentBody },
                { timeout: 30000 }
            );
            return response.data;
        },

        onMutate: async (variables) => {
            await queryClient.cancelQueries({
                queryKey: QUERY_KEYS.COMMENTS.BY_BLOG(blogId),
            });

            const prevComments = queryClient.getQueryData<TUserComment[]>(
                QUERY_KEYS.COMMENTS.BY_BLOG(blogId)
            );

            const optimisticComment: TUserComment = {
                _id: `temp-${Date.now()}`,
                commentAuthor: {
                    _id: currentUser._id,
                    username: currentUser.username,
                    profilePicture: currentUser.profilePicture ?? "",
                },
                body: variables.commentBody,
                date: new Date().toISOString(),
            };

            queryClient.setQueryData<TUserComment[]>(
                QUERY_KEYS.COMMENTS.BY_BLOG(blogId),
                (old) => (old ? [optimisticComment, ...old] : [optimisticComment])
            );

            return { prevComments };
        },
        onSuccess: (data) => {
            if (data.success === true) {
                queryClient.setQueryData(QUERY_KEYS.COMMENTS.USER_COMMENTS(currentUser._id), data);
                return toast.success(data.msg);
            }
            return toast.info("Problem while your posting comment !")
        },
        onError: (error: errorResponse) => {
            return toast.error(error.msg);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS.BY_BLOG(blogId) });
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS.USER_COMMENTS(currentUser._id) });
        }

    })
}

export default useCommentMutation;