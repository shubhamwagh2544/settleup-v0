import axios from 'axios';
import BACKEND_URL from '@/config.ts';

const api = axios.create({
    baseURL: BACKEND_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.response?.data?.message === 'jwt expired') {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
