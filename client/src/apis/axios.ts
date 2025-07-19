import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, includes } from 'lodash';
import { toast } from 'sonner';

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
        if (get(error, 'response.status') === 401 || includes(['jwt expired', 'Please authenticate first'], get(error, 'response.data.error'))) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            toast.warning('Your session has expired. Please login again.')
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
