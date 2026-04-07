import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Fixed: Backend endpoint is /auth/refresh-token, and it expects a Bearer token in the header
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data; // Unwrap ApiResponse
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(`/auth/me?t=${Date.now()}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/me', profileData);
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/auth/me/preferences', preferences);
    return response.data;
  },

  submitAdditionalDetails: async (details) => {
    const response = await api.post('/auth/register/details', details);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/auth/me');
    return response.data;
  },

  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin endpoints
  adminApproveUser: async (userId) => {
    const response = await api.put(`/auth/admin/users/${userId}/approve`);
    return response.data;
  },

  adminRejectUser: async (userId) => {
    const response = await api.put(`/auth/admin/users/${userId}/reject`);
    return response.data;
  },

  adminUpdateRole: async (userId, role) => {
    const response = await api.put(`/auth/admin/users/${userId}/role`, { role });
    return response.data;
  },

  adminDeleteUser: async (userId) => {
    const response = await api.delete(`/auth/admin/users/${userId}`);
    return response.data;
  },

  adminGetAllUsers: async () => {
    const response = await api.get('/auth/admin/users');
    return response.data;
  },
};

// Notification endpoints
export const notificationAPI = {
  getNotifications: async (page = 0, size = 10) => {
    const response = await api.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  getUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  createTestNotification: async (payload) => {
    const response = await api.post('/notifications/test', payload);
    return response.data;
  },
};

export default api;
