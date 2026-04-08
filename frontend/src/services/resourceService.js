import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/resources';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// POST /api/resources
export const createResource = (data) => api.post('', data);

// GET /api/resources
export const getAllResources = () => api.get('');

// GET /api/resources/{id}
export const getResourceById = (id) => api.get(`/${id}`);

// GET /api/resources/type/{type}?search=keyword
export const getResourcesByType = (type, search = '') =>
  api.get(`/type/${type}`, { params: search ? { search } : {} });

// PUT /api/resources/{id}
export const updateResource = (id, data) => api.put(`/${id}`, data);

// DELETE /api/resources/{id}
export const deleteResource = (id) => api.delete(`/${id}`);

export default api;
