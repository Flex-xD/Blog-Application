
// BASE URL for the API
export const BASE_URL = "http://localhost:4000/api";

// AUTH endpoints
export const AUTH_ENDPOINTS = {
    LOGIN : `${BASE_URL}/auth/login` , 
    REGISTER : `${BASE_URL}/auth/register` , 
    LOGOUT : `${BASE_URL}/auth/logout` , 
    GET_USER_DATA:`${BASE_URL}/user/user-data`
}

export const BLOG_ENDPOINTS = {
    CREATE_BLOG:`${BASE_URL}/blog/create`
}