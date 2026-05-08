/**
 * Utility functions for authenticated API requests
 */

const API_URL = import.meta.env.VITE_API_URL;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Refresh access token using refresh token
 */
function clearSessionAndRedirect() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      clearSessionAndRedirect();
      return false;
    }

    const response = await fetch(`${API_URL}/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      clearSessionAndRedirect();
      return false;
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Make an authenticated API request
 */
export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const isFormData = fetchOptions.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (!skipAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = localStorage.getItem('access_token');
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    }
  }

  return response;
}

/**
 * Make a GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Failed to fetch ${endpoint}`);
  }

  return response.json();
}

/**
 * Make a POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to post to ${endpoint}`);
  }

  return response.json();
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to patch ${endpoint}`);
  }

  return response.json();
}

/**
 * Make a PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to put ${endpoint}`);
  }

  return response.json();
}

/**
 * Make a DELETE request
 */
export async function apiDelete(endpoint: string): Promise<void> {
  const response = await authenticatedFetch(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.detail || `Failed to delete ${endpoint}`);
  }
}

/**
 * Logout and clear all auth tokens
 */
export async function logout(): Promise<void> {
  const refresh = localStorage.getItem('refresh_token');
  try {
    await fetch(`${API_URL}/users/admin/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // Ignore errors — clear tokens regardless
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}
