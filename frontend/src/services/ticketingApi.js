/**
 * Ticketing HTTP client for UniSphere (tickets, comments, status, etc.).
 * Uses the real JWT Bearer token from localStorage (same key as api.js interceptors).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

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

/**
 * Build request headers.
 * Attaches `Authorization: Bearer <token>` using the same `accessToken` key
 * as the main api.js Axios interceptor — no separate mock headers.
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
