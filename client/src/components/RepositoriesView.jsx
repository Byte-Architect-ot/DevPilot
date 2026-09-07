import React, { useState } from 'react';
import useRepos from '../hooks/useRepos';
import { useToast } from '../context/ToastContext';
import LanguageIcon from './LanguageIcon';
import IndexStatusBadge from './IndexStatusBadge';
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
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const RepositoriesView = () => {
  const { repositories, loading, syncing, lastSynced, syncRepos } = useRepos();
  const { connectedRepo, connectRepo } = useAuth();
  const { showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const languagesList = ['All', 'TypeScript', 'Java', 'C++', 'Python', 'Go', 'Rust', 'JavaScript'];

  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage =
      selectedLanguage === 'All' ||
      (repo.primary_language && repo.primary_language.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesLanguage;
  });

  const handleConnectRepo = (repo) => {
    connectRepo(repo);
    showSuccess(`Connected to repository "${repo.name}" for analysis.`);
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
              Connected GitHub repositories available for analysis, code search, and chat.
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
          Loading repositories from query cache...
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
                        <LanguageIcon language={repo.primary_language} showLabel={true} size="sm" />
                      </div>

                      <span className="text-xs text-zinc-400 font-mono block">
                        {repo.full_name || `devpilot/${repo.name}`}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <IndexStatusBadge status={repo.index_status} />
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5 border ${
                          repo.is_private
                            ? 'text-zinc-600 bg-zinc-100 border-zinc-200'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {repo.is_private ? <Lock size={10} /> : <Globe size={10} />}
                        {repo.is_private ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed mb-5 line-clamp-2 min-h-[36px]">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col gap-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
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
                      <span>{repo.default_branch || 'main'}</span>
                    </div>
                  </div>

                  {/* Chat Action Button */}
                  <button
                    onClick={() => handleConnectRepo(repo)}
                    className={`w-full font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs ${
                      isConnected
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check size={14} />
                        <span>Connected & Ready</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare size={14} />
                        <span>Chat with Repository</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RepositoriesView;
