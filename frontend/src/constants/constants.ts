
// BASE URL for the API
export const BASE_URL = "http://localhost:4000/api";

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
    AI_ENHCANCEMENT:`${BASE_URL}/llm/ai-enhancing`
}

export const SOCIAL_ENDPOINTS = {
    SUGGESTIONS_USERS_FOR_FOLLOWING: `${BASE_URL}/social/follow-suggestions`,
    FOLLOW_USER: (userToFollowId: string) => `${BASE_URL}/user/${userToFollowId}/follow`,
    UNFOLLOW_USER: (userToFollowId: string) => `${BASE_URL}/user/${userToFollowId}/unfollow`,
    USER_SUGGESTIONS: `${BASE_URL}/social/follow-suggestions` , 
    LIKE_BLOG:(blogToLikeId:string) => `${BASE_URL}/social/${blogToLikeId}/like` ,
    UNLIKE_BLOG:(blogToUnlikeId:string) => `${BASE_URL}/social/${blogToUnlikeId}/unlike` 
}

