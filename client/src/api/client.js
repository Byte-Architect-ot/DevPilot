/**
 * DevPilot API Fetch Utilities
 * Reusable functions to handle all backend communication with credentials and error handling.
 */

const API_BASE_URL = '';

/**
 * Core fetch wrapper with credential handling and error parsing
 */
export async function fetchApi(endpoint, options = {}) {
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      return { data: null, status: 401, error: 'Unauthorized' };
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Fallback to text status if json parsing fails
      }
      return { data: null, status: response.status, error: errorMessage };
    }

    // Check if response has body content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { data, status: response.status, error: null };
    }

    return { data: null, status: response.status, error: null };
  } catch (error) {
    return { data: null, status: 0, error: error.message || 'Network error' };
  }
}

/**
 * Get GitHub OAuth login URL from backend
 */
export async function getLoginUrl() {
  const result = await fetchApi('/api/auth/login-url');
  if (result.data && result.data.url) {
    return result.data.url;
  }
  return '/oauth2/authorization/github';
}

/**
 * Get current authenticated user details
 */
export async function getMe() {
  const result = await fetchApi('/api/auth/me');
  if (result.data) {
    return {
      id: result.data.id,
      github_id: result.data.githubId || result.data.github_id,
      github_username: result.data.githubUsername || result.data.github_username,
      display_name: result.data.displayName || result.data.display_name,
      avatar_url: result.data.avatarUrl || result.data.avatar_url,
    };
  }
  return null;
}

/**
 * Logout current user session
 */
export async function logoutUser() {
  return await fetchApi('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * Fetch repositories from backend
 */
export async function getRepositories() {
  const result = await fetchApi('/api/repositories');
  if (result.status === 401) return [];
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  return [];
}

/**
 * Trigger backend sync of GitHub repositories
 */
export async function syncRepositories() {
  const result = await fetchApi('/api/repositories/sync', {
    method: 'POST',
  });
  if (result.status === 401) return [];
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  return getRepositories();
}

/**
 * Trigger repository RAG indexing
 */
export async function indexRepository(repoId) {
  const result = await fetchApi(`/api/repositories/${repoId}/index`, {
    method: 'POST',
  });
  return result.data || result;
}

/**
 * Get repository indexing status and progress
 */
export async function getRepoIndexingStatus(repoId) {
  const result = await fetchApi(`/api/repositories/${repoId}/status`);
  return result.data || null;
}

/**
 * Send user prompt to RAG Chat endpoint for repository
 */
export async function sendRepoChatMessage(repoId, message) {
  const result = await fetchApi(`/api/repositories/${repoId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data;
}

