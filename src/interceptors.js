import axios from 'axios';
import { API_URL } from './utils/utils';

axios.defaults.withCredentials = true;

export const initInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Пропускаем исключённые пути
      const excludedPaths = [
        `${API_URL}auth/token`,
        `${API_URL}auth/logout`,
        `${API_URL}auth/request-password-reset`,
        `${API_URL}auth/verify-reset-token`,
        `${API_URL}auth/reset-password`
      ];

      if (excludedPaths.includes(originalRequest.url)) {
        console.log(`Skipping interceptor for ${originalRequest.url}`);
        return Promise.reject(error);
      }

      // Обработка 403 (Access Denied)
      if (error.response?.status === 403) {
        console.log('403 Forbidden, redirecting to /access-denied');
        window.location.href = `/access-denied?from=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject(error);
      }

      // Обработка 401 (Unauthorized)
      if (error.response?.status === 401) {
        console.log('Caught 401 for URL:', originalRequest.url, 'Detail:', error.response?.data?.detail);
        try {
          await axios.post(`${API_URL}auth/logout`, {}, { withCredentials: true, timeout: 5000 });
          console.log('Logout successful');
        } catch (logoutError) {
          console.error('Logout failed:', logoutError);
        }
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject(error);
      }

      console.error('Request failed with error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: originalRequest.url,
      });
      return Promise.reject(error);
    }
  );
};