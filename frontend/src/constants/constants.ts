
// BASE URL for the API
export const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api` || "http://localhost:4000/api";

// AUTH endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    GET_USER_DATA: `${BASE_URL}/user/user-data`,

}

export const BLOG_ENDPOINTS = {
    CREATE_BLOG: `${BASE_URL}/blog/create`,
    USER_FEED: `${BASE_URL}/blog/feed`,
    SEARCH: `${BASE_URL}/blog/search`,
    USER_FOLLOWING_BLOGS: `${BASE_URL}/blog/following-blogs`,
    AI_ENHCANCEMENT: `${BASE_URL}/llm/ai-enhancing`,
    SAVE_BLOG: (blogId: string) => `${BASE_URL}/blog/${blogId}/save-blog`,
    POPULAR: `${BASE_URL}/blog/popular-blogs`,
    DELETE_USER_BLOG: (blogId: string) => `${BASE_URL}/blog/${blogId}/delete-blog` , 
    USER_SAVED_BLOGS:`${BASE_URL}/blog/saves` , 
    UNSAVE_BLOG:(blogId:string) => `${BASE_URL}/blog/${blogId}/unsave-blog`
}

export const SOCIAL_ENDPOINTS = {
    SUGGESTIONS_USERS_FOR_FOLLOWING: `${BASE_URL}/social/follow-suggestions`,
    FOLLOW_USER: (userToFollowId: string) => `${BASE_URL}/user/${userToFollowId}/follow`,
    UNFOLLOW_USER: (userToFollowId: string) => `${BASE_URL}/user/${userToFollowId}/unfollow`,
    USER_SUGGESTIONS: `${BASE_URL}/social/follow-suggestions`,
    LIKE_BLOG: (blogToLikeId: string) => `${BASE_URL}/social/${blogToLikeId}/like`,
    UNLIKE_BLOG: (blogToUnlikeId: string) => `${BASE_URL}/social/${blogToUnlikeId}/unlike`,
    COMMENT_BLOG: (blogId: string) => `${BASE_URL}/social/${blogId}/comment`,
    UPDATE_PROFILE_PICTURE: `${BASE_URL}/social/update-profile-picture` , 
    SEARCH_USERS:`${BASE_URL}/social/search-users`
}

