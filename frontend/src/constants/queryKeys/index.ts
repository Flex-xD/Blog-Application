export const QUERY_KEYS = {
    PROFILE: ["profile", "me"],
    POSTS: {
        ALL: ["posts"],
        BY_ID: (userId: string) => ["posts", userId] as const,
        BY_USER: (userId: string) => ["posts", "user", userId] as const,
        USER_FEED:(userId:string) => ["posts"  , "userFeed" , userId]
    },
    COMMENTS: {
        BY_POST: (postId: string) => ["comments", postId] as const,
    },
};