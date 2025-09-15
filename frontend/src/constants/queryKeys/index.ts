export const QUERY_KEYS = {
    // Current logged-in user
    PROFILE: {
        ME: ["profile", "me"] as const,
        BY_ID: (userId: string) => ["profile", userId] as const,
        FOLLOWERS: (userId: string) => ["profile", userId, "followers"] as const,
        FOLLOWING: (userId: string) => ["profile", userId, "following"] as const,
    },

    // Blogs
    BLOGS: {
        ALL: ["blogs"] as const, // global blogs (explore page, all blogs)
        BY_ID: (blogId: string) => ["blogs", "id", blogId] as const, // single blog
        BY_USER: (userId: string) => ["blogs", "user", userId] as const, // blogs of a specific user
        FEED: (userId: string) => ["blogs", "feed", userId] as const, // personalized feed for a user
        SAVED: (userId: string) => ["blogs", "saved", userId] as const, // blogs a user has saved
    },

    // Comments
    COMMENTS: {
        BY_BLOG: (blogId: string) => ["comments", "blog", blogId] as const,
    },
    
    SOCIAL: {
        FOLLOWING_STATUS: (targetUserId: string) => ["social", "following-status", targetUserId] as const,
        SUGGESTIONS: (userId: string) => ["social", "suggestions", userId] as const, // follow suggestions
        MUTUALS: (userId: string) => ["social", "mutuals", userId] as const, // mutual followers with a user
    }
};
