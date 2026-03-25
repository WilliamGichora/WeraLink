import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const urlsToIgnore = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/resend-otp', '/auth/verify-otp', '/auth/forgot-password'];

        if (error.response?.status === 401 && !originalRequest._retry && !urlsToIgnore.includes(originalRequest.url || '')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Since we're using HttpOnly cookies, we just hit the refresh endpoint
                // The cookies are handled automatically by the browser with each request
                await api.post('/auth/refresh');
                isRefreshing = false;
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                
                // If refresh fails, the tokens are likely invalid, so we clear local state (handled by UI layer observing 401/403)
                // Note: Don't logout manually here to avoid endless loops, let the context handler deal with final redirection
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
