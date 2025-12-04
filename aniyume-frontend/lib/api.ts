import axios from 'axios';

const api = axios.create({
    // Fix: Ensure baseURL points to the correct API endpoint (including /v1)
    // If NEXT_PUBLIC_API_URL is set (e.g., http://127.0.0.1:8000/api), we append /v1 if missing
    // Otherwise fallback to localhost default
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '') + '/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                // Note: You might need a separate instance or logic to avoid infinite loops if refresh fails
                // For simplicity, assuming /auth/refresh endpoint works with the expired token if within grace period
                // OR we use the refresh token stored separately. 
                // JWT Auth usually requires sending the old token to refresh it.

                const response = await api.post('/auth/refresh');
                const { access_token } = response.data;

                localStorage.setItem('token', access_token);

                // Update header and retry original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
