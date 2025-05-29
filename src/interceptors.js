import axios from 'axios';
import { API_URL } from './utils/utils';

axios.defaults.withCredentials = true;

export const initInterceptor = () => {
  let isRefreshing = false;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Пропускаем /auth/refresh и /auth/logout
      if (
        originalRequest.url === API_URL + 'auth/refresh' ||
        originalRequest.url === API_URL + 'auth/logout'
      ) {
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        window.location.href = '/access-denied?from=' + 
          encodeURIComponent(window.location.pathname);
        return Promise.reject(error);
      }


      // Обрабатываем 401
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('Caught 401 for URL:', originalRequest.url);

        if (isRefreshing) {
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!isRefreshing) {
                clearInterval(interval);
                resolve(axios(originalRequest));
              }
            }, 100);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('Attempting to refresh token');
          await axios.post(`${API_URL}auth/refresh`, {});
          isRefreshing = false;
          console.log('Token refresh successful, retrying original request');
          return axios(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          console.error('Refresh token failed:', {
            status: refreshError.response?.status,
            data: refreshError.response?.data,
            message: refreshError.message,
          });
          try {
            await axios.post(`${API_URL}auth/logout`, {});
          } catch (logoutError) {
            console.log('Logout failed:', logoutError);
          }
          window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};