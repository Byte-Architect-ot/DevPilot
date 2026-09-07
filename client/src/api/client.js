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
 * Mock repositories fallback list for rich repository analysis showcase
 */
const MOCK_REPOSITORIES = [
  {
    id: 1,
    name: 'devpilot-core',
    full_name: 'devpilot/devpilot-core',
    description: 'AI-driven repository analysis engine with multi-language parsing and dependency graph mapping.',
    primary_language: 'TypeScript',
    stars: 342,
    forks: 48,
    is_private: false,
    updated_at: '2026-09-06T14:22:00Z',
    default_branch: 'main',
    open_issues: 3,
  },
  {
    id: 2,
    name: 'backend-services',
    full_name: 'devpilot/backend-services',
    description: 'Spring Boot REST backend with OAuth2 authentication and MySQL persistence layer.',
    primary_language: 'Java',
    stars: 128,
    forks: 19,
    is_private: false,
    updated_at: '2026-09-07T18:45:00Z',
    default_branch: 'main',
    open_issues: 1,
  },
  {
    id: 3,
    name: 'native-parser',
    full_name: 'devpilot/native-parser',
    description: 'High-performance C++ AST syntax trees collector for deep static codebase audits.',
    primary_language: 'C++',
    stars: 215,
    forks: 31,
    is_private: true,
    updated_at: '2026-09-05T09:10:00Z',
    default_branch: 'master',
    open_issues: 0,
  },
  {
    id: 4,
    name: 'web-client',
    full_name: 'devpilot/web-client',
    description: 'Minimalist white light mode React frontend for DevPilot analysis workflow.',
    primary_language: 'JavaScript',
    stars: 89,
    forks: 12,
    is_private: false,
    updated_at: '2026-09-07T21:00:00Z',
    default_branch: 'main',
    open_issues: 2,
  },
  {
    id: 5,
    name: 'ml-code-ranker',
    full_name: 'devpilot/ml-code-ranker',
    description: 'Python code summarization pipelines using modern embedding models.',
    primary_language: 'Python',
    stars: 567,
    forks: 94,
    is_private: false,
    updated_at: '2026-09-04T11:30:00Z',
    default_branch: 'main',
    open_issues: 5,
  },
  {
    id: 6,
    name: 'proxy-router',
    full_name: 'devpilot/proxy-router',
    description: 'Ultra-fast Go microservice routing API traffic with zero memory overhead.',
    primary_language: 'Go',
    stars: 410,
    forks: 55,
    is_private: true,
    updated_at: '2026-09-03T16:20:00Z',
    default_branch: 'main',
    open_issues: 1,
  },
  {
    id: 7,
    name: 'rust-security-scanner',
    full_name: 'devpilot/rust-security-scanner',
    description: 'Memory-safe dependency audit and SAST rule evaluator written in Rust.',
    primary_language: 'Rust',
    stars: 620,
    forks: 73,
    is_private: false,
    updated_at: '2026-09-06T20:15:00Z',
    default_branch: 'main',
    open_issues: 4,
  },
  {
    id: 8,
    name: 'doc-generator',
    full_name: 'devpilot/doc-generator',
    description: 'Automated Markdown and HTML documentation extractor.',
    primary_language: 'HTML',
    stars: 45,
    forks: 6,
    is_private: false,
    updated_at: '2026-08-30T10:00:00Z',
    default_branch: 'main',
    open_issues: 0,
  }
];

/**
 * Fetch repositories from backend or fallback to initial data
 */
export async function getRepositories() {
  const result = await fetchApi('/api/repositories');
  if (result.data && Array.isArray(result.data) && result.data.length > 0) {
    return result.data;
  }
  return MOCK_REPOSITORIES;
}

/**
 * Trigger backend sync of GitHub repositories
 */
export async function syncRepositories() {
  const result = await fetchApi('/api/repositories/sync', {
    method: 'POST',
  });
  if (result.data && Array.isArray(result.data) && result.data.length > 0) {
    return result.data;
  }
  return getRepositories();
}
