import api from './api';

// POST /api/resources
export const createResource = (data) => api.post('/resources', data);

// GET /api/resources
export const getAllResources = () => api.get('/resources');

// GET /api/resources/{id}
export const getResourceById = (id) => api.get(`/resources/${id}`);

// GET /api/resources/type/{type}?search=keyword
export const getResourcesByType = (type, search = '') =>
  api.get(`/resources/type/${type}`, { params: search ? { search } : {} });

// PUT /api/resources/{id}
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);

// DELETE /api/resources/{id}
export const deleteResource = (id) => api.delete(`/resources/${id}`);

export default api;
