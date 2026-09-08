import { useState, useEffect, useCallback } from 'react';
import { getRepositories, syncRepositories as apiSyncRepos } from '../api/client';
import { useToast } from '../context/ToastContext';

// Unified In-Memory Query Cache
let queryCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 60000; // 1 minute

export const useRepos = () => {
  const [repositories, setRepositories] = useState(queryCache.data || []);
  const [loading, setLoading] = useState(!queryCache.data);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(queryCache.timestamp ? new Date(queryCache.timestamp) : null);
  const { showSuccess, showError, showInfo } = useToast();

  const normalizeRepo = (repo) => ({
    id: repo.id,
    githubRepoId: repo.githubRepoId || repo.github_repo_id || repo.id,
    name: repo.name || 'unnamed-repo',
    full_name: repo.fullName || repo.full_name || `devpilot/${repo.name}`,
    fullName: repo.fullName || repo.full_name || `devpilot/${repo.name}`,
    owner: repo.owner || 'owner',
    description: repo.description || '',
    primary_language: repo.language || repo.primary_language || 'Other',
    language: repo.language || repo.primary_language || 'Other',
    stars: repo.stars !== undefined && repo.stars !== null ? repo.stars : 0,
    forks: repo.forks !== undefined && repo.forks !== null ? repo.forks : 0,
    is_private: repo.isPrivate !== undefined ? repo.isPrivate : (repo.is_private || false),
    isPrivate: repo.isPrivate !== undefined ? repo.isPrivate : (repo.is_private || false),
    default_branch: repo.defaultBranch || repo.default_branch || 'main',
    defaultBranch: repo.defaultBranch || repo.default_branch || 'main',
    // Preserve indexing status in both naming conventions
    indexStatus: repo.indexStatus || repo.index_status || 'PENDING',
    index_status: repo.indexStatus || repo.index_status || 'PENDING',
    indexed_at: repo.indexedAt || repo.indexed_at || null,
    indexedAt: repo.indexedAt || repo.indexed_at || null,
    html_url: repo.htmlUrl || repo.html_url || '',
    htmlUrl: repo.htmlUrl || repo.html_url || '',
    updated_at: repo.updatedAt || repo.updated_at || new Date().toISOString(),
    updatedAt: repo.updatedAt || repo.updated_at || new Date().toISOString(),
    // Preserve indexing progress fields (camelCase from backend)
    chunkCount: repo.chunkCount || repo.chunk_count || 0,
    filesProcessed: repo.filesProcessed || repo.files_processed || 0,
    filesTotal: repo.filesTotal || repo.files_total || 0,
    errorMessage: repo.errorMessage || repo.error_message || null,
  });

  const fetchRepos = useCallback(async (force = false) => {
    const now = Date.now();
    const isCacheValid = queryCache.data && (now - queryCache.timestamp < CACHE_TTL);

    if (isCacheValid && !force) {
      setRepositories(queryCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRepositories();
      const normalized = (data || []).map(normalizeRepo);
      
      queryCache = {
        data: normalized,
        timestamp: now,
      };

      setRepositories(normalized);
      setLastSynced(new Date(now));
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncRepos = useCallback(async () => {
    setSyncing(true);
    showInfo('Syncing repositories with GitHub API...');

    try {
      const syncedData = await apiSyncRepos();
      const normalized = (syncedData || []).map(normalizeRepo);

      const now = Date.now();
      queryCache = {
        data: normalized,
        timestamp: now,
      };

      setRepositories(normalized);
      setLastSynced(new Date(now));
      showSuccess(`Successfully synchronized ${normalized.length} repositories`);
    } catch (err) {
      showError('Failed to sync repositories from GitHub');
      fetchRepos(true);
    } finally {
      setSyncing(false);
    }
  }, [showInfo, showSuccess, showError, fetchRepos]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return {
    repositories,
    loading,
    syncing,
    error,
    lastSynced,
    fetchRepos: () => fetchRepos(true),
    syncRepos,
  };
};

export default useRepos;
