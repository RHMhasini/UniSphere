import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Interceptor to attach the mock user headers for backend endpoints
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('mockUser');
  if (userStr) {
    const user = JSON.parse(userStr);
    config.headers['X-User-Id'] = user.id;
    config.headers['X-User-Name'] = user.name;
    // We can also pass Role if the backend ever requests it
    config.headers['X-User-Role'] = user.role;
  }
  return config;
});

export default api;
