import axios from "axios";

const apiClient = axios.create({
    baseURL:`${import.meta.env.VITE_BASE_URL}/api` || "http://localhost:4000/api" , 
    withCredentials:true , 
    timeout:10000 , 
    headers:{
        "Content-Type":"application/json" , 
    }
})

export default apiClient;