import axios from "axios";
import { API_BASE } from "./config";
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from "./auth";
import toast from "react-hot-toast";

const axiosInstance = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

axiosInstance.interceptors.request.use((config) => {
    const access = getAccessToken();
    if (access && !isTokenExpired(access)) config.headers.Authorization = `Bearer ${access}`;
    return config;
});

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = getRefreshToken();
            if (refresh && !isTokenExpired(refresh)) {
                try {
                    const { data } = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
                    setTokens(data.access, refresh);
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return axiosInstance(originalRequest);
                } catch {
                    toast.error("Session expirée, reconnectez-vous");
                    clearTokens();
                    window.location.href = "/login";
                }
            } else {
                toast.error("Session expirée, reconnectez-vous");
                clearTokens();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
