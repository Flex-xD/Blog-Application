export const QUERY_KEYS = {
    // Current logged-in user
    PROFILE: {
        ME: ["profile", "me"] as const,
        BY_ID: (userId: string) => ["profile", userId] as const,
        FOLLOWERS: (userId: string) => ["profile", userId, "followers"] as const,
        FOLLOWING: (userId: string) => ["profile", userId, "following"] as const,
    },

    BLOGS: {
        ALL: ["blogs"] as const,
        BY_ID: (blogId: string) => ["blogs", "id", blogId] as const,
        BY_USER: (userId: string) => ["blogs", "user", userId] as const,
        FEED: (userId: string, page?: number, limit?: number, query?: string) =>
            query
                ? ["blogs", "feed", userId, page, limit, query] as const
                : ["blogs", "feed", userId, page, limit] as const,
        FOLLOWING: (userId: string, page?: number, limit?: number) =>
            ["blogs", "following", userId, page, limit] as const,
        SAVED: (userId: string) => ["blogs", "saved", userId] as const,
        POPULAR: (page: number, limit: number) => ["blogs", "popular", page, limit],
    },

    // Comments
    COMMENTS: {
        ALL_COMMENTS: ["comments"],
        USER_COMMENTS: (userId: string) => ["comments", "user", userId],
        BY_BLOG: (blogId: string) => ["comments", "blog", blogId] as const,
    },

    SOCIAL: {
        FOLLOWING_STATUS: (targetUserId: string) => ["social", "following-status", targetUserId] as const,
        SUGGESTIONS: (userId: string) => ["social", "suggestions", userId] as const, // follow suggestions
        MUTUALS: (userId: string) => ["social", "mutuals", userId] as const, // mutual followers with a user
    },

    LIKES: {
        ALL: ["likes"] as const,
        PERSONAL_LIKES: (userId: string, blogId: string) => ["likes", userId, blogId],
    }
    ,
    CONTENT: {
        ENHANCEMENT: ["content", "enhancement"] as const, // AI content enhancement
    },
    USERS: {
        SEARCH: (userId: string, page: number, limit: number, query: string) => [
            "users",
            "search",
            userId,
            page,
            limit,
            query,
        ],
    }
};
