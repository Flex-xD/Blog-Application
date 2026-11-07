import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_BASE_URL?.trim() || "http://localhost:4000";

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;