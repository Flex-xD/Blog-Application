import { useCallback } from "react";
import type { UserFeedData } from "../UserFeedFetching";
import type { UserFollowingBlogsData } from "../FollowingBlogs";
import type { PopularBlogsData } from "../PopularBlogsFetching";
import type { QueryObserverResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";

type IUseFeedRefresh = {
    refetchFeed: () => Promise<QueryObserverResult<UserFeedData, AxiosError>>;
    refetchFollowing: () => Promise<QueryObserverResult<UserFollowingBlogsData, AxiosError>>;
    refetchPopular: () => Promise<QueryObserverResult<PopularBlogsData, AxiosError>>;
    activeTab: string; 
    searchQuery:string
};

const useFeedRefresh = ({
    refetchFeed,
    refetchFollowing,
    refetchPopular,
    activeTab,
    searchQuery
}: IUseFeedRefresh) => {
    const refreshFeed = useCallback(() => {
        if (searchQuery.trim()) return;
        switch (activeTab) {
            case "for-you":
                refetchFeed();
                break;
            case "following":
                refetchFollowing?.();
                break;
            case "trending":
                refetchPopular?.();
                break;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [activeTab, refetchFeed, refetchFollowing, refetchPopular, searchQuery]);

    return refreshFeed;
};

export default useFeedRefresh;
