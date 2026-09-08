import React, { useState } from 'react';
import Sidebar from './Sidebar';
import UserNav from './UserNav';
import OverviewView from './OverviewView';
import RepositoriesView from './RepositoriesView';
import ChatView from './ChatView';
import SettingsView from './SettingsView';
import PlaceholderView from './PlaceholderView';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, connectedRepo } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Overview';
      case 'repositories':
        return 'Repositories';
      case 'chat':
        return 'RAG Code Chat';
      case 'security':
        return 'Code Security';
      case 'pull-requests':
        return 'Pull Requests';
      case 'dependencies':
        return 'Dependency Audit';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Fixed Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="ml-[260px] flex-1 flex flex-col min-w-0 bg-white">
        {/* Application Shell Top Bar */}
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 font-medium">
              DevPilot
            </span>
            <span className="text-sm text-zinc-300">/</span>
            <span className="text-sm text-zinc-900 font-semibold">
              {getBreadcrumbTitle()}
            </span>
          </div>

          {/* User Credentials & Active Connected Repo & Shell Nav */}
          <div className="flex items-center gap-4">
            {connectedRepo && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1 text-xs text-emerald-950">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="font-semibold">Connected Repo:</span>
                <span className="font-mono text-emerald-900">{connectedRepo.name}</span>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1 text-xs text-zinc-600">
                <span className="font-semibold text-zinc-900">User ID:</span>
                <span className="font-mono">
                  {user.id ? `${user.id.substring(0, 8)}...` : 'N/A'}
                </span>
              </div>
            )}

            <UserNav />
          </div>
        </header>

        {/* View Body */}
        <main className="p-8 flex-1 bg-white">
          {activeTab === 'overview' && (
            <OverviewView onNavigateToRepos={() => setActiveTab('repositories')} />
          )}
          {activeTab === 'repositories' && <RepositoriesView />}
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'settings' && <SettingsView />}
          {['security', 'pull-requests', 'dependencies'].includes(activeTab) && (
            <PlaceholderView tabId={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
