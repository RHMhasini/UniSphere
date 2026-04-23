import api from './api';

export const createResource = (data) => api.post('/resources', data);

export const getAllResources = () => api.get('/resources');

export const getResourceById = (id) => api.get(`/resources/${id}`);

export const getResourcesByType = (type, search = '') =>
  api.get(`/resources/type/${type}`, { params: search ? { search } : {} });

export const updateResource = (id, data) => api.put(`/resources/${id}`, data);

export const deleteResource = (id) => api.delete(`/resources/${id}`);

export default api;
