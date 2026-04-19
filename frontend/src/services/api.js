/**
 * Central API Service for UniSphere.
 * Automatically attaches mock authentication headers from the active session.
 */

const BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const saved = localStorage.getItem('unisphere_auth');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      // Bridge headers for mock authentication
      // Backend expects X-User-Email and X-User-Role
      headers['X-User-Email'] = user.email || (user.name.toLowerCase().replace(' ', '.') + '@sliit.lk');
      headers['X-User-Role'] = user.role;
    } catch (e) {
      console.error('Failed to parse auth header', e);
    }
  }

  return headers;
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  patch: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw await response.json();
    return true;
  },
};
