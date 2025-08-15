import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/constants/queryKeys";

const useUserFeedData = () => {
    // Replace 'userId' with the actual user id value you want to use
    const userId = "someUserId";
    return useQuery({
        queryKey: QUERY_KEYS.POSTS.USER_FEED(userId),
        queryFn: async () => {
            // Your fetch logic here
        }
    })
}

export default useUserFeedData();