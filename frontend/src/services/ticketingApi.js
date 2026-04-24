/**
 * Ticketing HTTP client for UniSphere (tickets, comments, status, etc.).
 * Automatically attaches mock authentication headers from the active session.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const buildError = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  let payload = null;
  try {
    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      const text = await response.text();
      payload = text ? { message: text } : null;
    }
  } catch {
    payload = null;
  }

  const message =
    payload?.message ||
    payload?.error ||
    (payload?.fieldErrors ? 'Validation failed' : null) ||
    response.statusText ||
    `Request failed (${response.status})`;

  const err = new Error(message);
  err.status = response.status;
  err.details = payload;
  return err;
};

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
      headers['X-User-Email'] = user.email || (user.name.toLowerCase().replace(' ', '.') + '@university.edu');
      headers['X-User-Role'] = user.role;
    } catch (e) {
      console.error('Failed to parse auth header', e);
    }
  }

  return headers;
};

export const ticketingApi = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw await buildError(response);
    return response.json();
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await buildError(response);
    return response.json();
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await buildError(response);
    return response.json();
  },

  patch: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await buildError(response);
    return response.json();
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw await buildError(response);
    return true;
  },
};
