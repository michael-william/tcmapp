/**
 * API Client
 *
 * Axios instance configured with base URL and JWT token interceptor.
 */

import axios from 'axios';


// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const api = axios.create({
  // Use a relative path so the Nginx proxy handles the routing
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and let React handle the rest
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // No redirect - React will detect missing token and redirect naturally
    }
    return Promise.reject(error);
  }
);

export default api;
