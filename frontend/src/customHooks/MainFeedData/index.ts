import { useMemo } from "react";
import useUserFeedData from "../UserFeedFetching";
import useUserFollowingBlogsData from "../FollowingBlogs";
import usePopularBlogs from "../PopularBlogsFetching";
import useSearchBlogsQuery from "../SearchBlogs";

const useFeedData = (userId: string, activeTab: string, searchQuery: string, page: number) => {
    const { data: userFeedData, isPending: userFeedPending, error: userFeedError, refetch: refetchFeed } = useUserFeedData(
        userId, activeTab === "for-you" && !searchQuery ? page : 1
    );
    const { data: followingBlogs, isPending: followingPending, refetch: refetchFollowing } = useUserFollowingBlogsData(
        userId, activeTab === "following" && !searchQuery ? page : 1
    );
    const { data: popularBlogs, isPending: popularPending, refetch: refetchPopular } = usePopularBlogs(
        activeTab === "trending" && !searchQuery ? page : 1
    );
    const { data: searchResults, isPending: searchPending, error: searchError } = useSearchBlogsQuery({
        userId,
        query: searchQuery,
        page,
        limit: 10,
    });

    const activeData = useMemo(() => {
        if (searchQuery.trim()) return searchResults;
        switch (activeTab) {
            case "following": return followingBlogs;
            case "trending": return popularBlogs;
            default: return userFeedData;
        }
    }, [searchQuery, activeTab, userFeedData, followingBlogs, popularBlogs, searchResults]);

    const isPending = useMemo(() => {
        if (searchQuery.trim()) return searchPending;
        switch (activeTab) {
            case "following": return followingPending;
            case "trending": return popularPending;
            default: return userFeedPending;
        }
    }, [searchQuery, activeTab, userFeedPending, followingPending, popularPending, searchPending]);

    const error = useMemo(() => {
        if (searchQuery.trim() && searchError) return new Error(searchError.message || "Failed to fetch search results");
        if (activeTab === "for-you" && userFeedError) return new Error(userFeedError.message || "Failed to fetch feed data");
        return null;
    }, [searchQuery, activeTab, userFeedError, searchError]);

    return { activeData, isPending, error, refetchFeed, refetchFollowing, refetchPopular };
};

export default useFeedData;