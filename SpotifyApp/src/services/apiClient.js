// src/services/apiClient.js
//
// Single axios instance used by every *Api.js module. Handles attaching the
// JWT access token and transparently refreshing it on a 401, so individual
// service functions never have to think about auth plumbing.
//
// Replaces the old pattern of reading/writing localStorage directly from
// components (utils/auth.js, utils/localStorage.js) for anything that is
// now a real backend resource. localStorage is still used here, but only
// as token storage -- exactly what every JWT-based SPA does.

import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set: (access, refresh) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshingPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retried && tokenStorage.getRefresh()) {
      config._retried = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = axios
            .post(`${API_BASE_URL}/auth/refresh/`, { refresh: tokenStorage.getRefresh() })
            .then((res) => {
              tokenStorage.set(res.data.access, res.data.refresh);
              return res.data.access;
            })
            .finally(() => {
              refreshingPromise = null;
            });
        }
        const newAccess = await refreshingPromise;
        config.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(config);
      } catch (refreshError) {
        tokenStorage.clear();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
