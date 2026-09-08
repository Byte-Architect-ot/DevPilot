import React, { useState, useEffect } from 'react';
import useRepos from '../hooks/useRepos';
import { useToast } from '../context/ToastContext';
import LanguageIcon from './LanguageIcon';
import IndexStatusBadge from './IndexStatusBadge';
import ChatModal from './ChatModal';
import { indexRepository, getRepoIndexingStatus } from '../api/client';
import {
  Search,
  Star,
  GitFork,
  Lock,
  Globe,
  MessageSquare,
  RefreshCw,
  GitBranch,
  Check,
  Cpu,
  Layers,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const RepositoriesView = () => {
  const { repositories: initialRepos, loading, syncing, lastSynced, syncRepos } = useRepos();
  const [repositories, setRepositories] = useState([]);
  const { connectedRepo, connectRepo } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [activeChatRepo, setActiveChatRepo] = useState(null);
  const [indexingMap, setIndexingMap] = useState({});

  useEffect(() => {
    if (initialRepos) {
      setRepositories(initialRepos);
    }
  }, [initialRepos]);

  // Polling loop for any repo in INDEXING state
  useEffect(() => {
    const indexingRepos = repositories.filter(
      (r) => r.indexStatus === 'INDEXING' || r.index_status === 'INDEXING' || indexingMap[r.id]
    );

    if (indexingRepos.length === 0) return;

    const interval = setInterval(async () => {
      for (const repo of indexingRepos) {
        try {
          const statusData = await getRepoIndexingStatus(repo.id);
          if (statusData) {
            setRepositories((prev) =>
              prev.map((r) => (r.id === repo.id ? { ...r, ...statusData } : r))
            );

            if (statusData.indexStatus === 'READY' || statusData.indexStatus === 'FAILED') {
              setIndexingMap((prev) => ({ ...prev, [repo.id]: false }));
              if (statusData.indexStatus === 'READY') {
                showSuccess(`Repository "${repo.name}" indexing completed successfully!`);
              } else if (statusData.indexStatus === 'FAILED') {
                showError(`Indexing failed for "${repo.name}": ${statusData.errorMessage || 'Unknown error'}`);
              }
            }
          }
        } catch (e) {
          // ignore polling errors
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [repositories, indexingMap]);

  const languagesList = ['All', 'TypeScript', 'Java', 'C++', 'Python', 'Go', 'Rust', 'JavaScript'];

  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage =
      selectedLanguage === 'All' ||
      (repo.primary_language && repo.primary_language.toLowerCase() === selectedLanguage.toLowerCase()) ||
      (repo.language && repo.language.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesLanguage;
  });

  const handleStartIndexing = async (e, repo) => {
    e.stopPropagation();
    try {
      setIndexingMap((prev) => ({ ...prev, [repo.id]: true }));
      const result = await indexRepository(repo.id);
      showSuccess(`Indexing started for "${repo.name}". Vector embeddings building in background...`);
      setRepositories((prev) =>
        prev.map((r) => (r.id === repo.id ? { ...r, ...result, indexStatus: 'INDEXING' } : r))
      );
    } catch (err) {
      showError(`Failed to start indexing: ${err.message}`);
      setIndexingMap((prev) => ({ ...prev, [repo.id]: false }));
    }
  };

  const handleOpenChat = (repo) => {
    connectRepo(repo);
    setActiveChatRepo(repo);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">
              Repositories
            </h1>
            <p className="text-sm text-zinc-600">
              Connected GitHub repositories available for RAG code analysis, vector search, and chat.
              {lastSynced && (
                <span className="text-xs text-zinc-400 block mt-0.5 font-mono">
                  Last synced: {lastSynced.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={syncRepos}
            disabled={syncing}
            className="bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin text-zinc-900' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Repositories'}</span>
          </button>
        </div>

        {/* Search & Language Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search repositories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
          </div>

          {/* Language Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {languagesList.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid or Empty/Loading State */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-sm text-zinc-500 shadow-2xs">
          Loading repositories from backend...
        </div>
      ) : filteredRepositories.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-2xs">
          <h3 className="text-base font-semibold text-zinc-900 mb-1">
            No repositories found
          </h3>
          <p className="text-sm text-zinc-500">
            Try adjusting your search query or language filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepositories.map((repo) => {
            const isConnected = connectedRepo && (connectedRepo.id === repo.id || connectedRepo.name === repo.name);
            const status = repo.indexStatus || repo.index_status || 'PENDING';
            const isIndexing = status === 'INDEXING' || indexingMap[repo.id];
            const isReady = status === 'READY';

            const filesProcessed = repo.filesProcessed || repo.files_processed || 0;
            const filesTotal = repo.filesTotal || repo.files_total || 0;
            const chunkCount = repo.chunkCount || repo.chunk_count || 0;
            const progressPercent = filesTotal > 0 ? Math.min(100, Math.round((filesProcessed / filesTotal) * 100)) : 0;

            return (
              <div
                key={repo.id}
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-all duration-150 shadow-2xs hover:shadow-xs ${
                  isConnected ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div>
                  {/* Header: Title + Language Icon + Index Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                          {repo.name}
                        </h3>

                        {/* Language Badge */}
                        <LanguageIcon language={repo.primary_language || repo.language} showLabel={true} size="sm" />
                      </div>

                      <span className="text-xs text-zinc-400 font-mono block">
                        {repo.full_name || repo.fullName || `devpilot/${repo.name}`}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <IndexStatusBadge status={status} />
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5 border ${
                          repo.is_private || repo.isPrivate
                            ? 'text-zinc-600 bg-zinc-100 border-zinc-200'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {repo.is_private || repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                        {repo.is_private || repo.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed mb-4 line-clamp-2 min-h-[36px]">
                    {repo.description || 'No description provided.'}
                  </p>

                  {/* Indexing Progress Indicator if Indexing */}
                  {isIndexing && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-blue-900 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw size={12} className="animate-spin text-blue-600" />
                          Indexing Vector Embeddings...
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-blue-700 font-mono">
                        <span>Files: {filesProcessed} / {filesTotal || '?'}</span>
                        <span>Chunks: {chunkCount}</span>
                      </div>
                    </div>
                  )}

                  {/* Ready Chunks Stats */}
                  {isReady && chunkCount > 0 && !isIndexing && (
                    <div className="mb-4 bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-emerald-900 font-mono">
                      <span className="flex items-center gap-1">
                        <Layers size={12} className="text-emerald-600" />
                        RAG Chunks Indexed
                      </span>
                      <span className="font-bold">{chunkCount} chunks</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-1">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-500" />
                      <span>{repo.stars || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork size={14} />
                      <span>{repo.forks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch size={14} />
                      <span>{repo.default_branch || repo.defaultBranch || 'main'}</span>
                    </div>
                  </div>

                  {/* Actions: Index / Re-Index + Chat */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleStartIndexing(e, repo)}
                      disabled={isIndexing}
                      className="flex-1 font-semibold text-xs py-2 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Cpu size={13} className={isIndexing ? 'animate-spin' : ''} />
                      <span>{isIndexing ? 'Indexing...' : isReady ? 'Re-Index' : 'Index Repo'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenChat(repo)}
                      className={`flex-1 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                        isConnected
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      }`}
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RAG Chat Modal */}
      {activeChatRepo && (
        <ChatModal
          repo={activeChatRepo}
          onClose={() => setActiveChatRepo(null)}
        />
      )}
    </div>
  );
};

export default RepositoriesView;
