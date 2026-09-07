import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldCheck,
  GitPullRequest,
  Boxes,
  Settings,
  GitBranch,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const mainNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const analyticalPlaceholders = [
    { id: 'security', label: 'Code Security', icon: ShieldCheck, badge: 'AI' },
    { id: 'pull-requests', label: 'Pull Requests', icon: GitPullRequest, badge: 'Beta' },
    { id: 'dependencies', label: 'Dependency Audit', icon: Boxes },
  ];

  return (
    <aside className="w-[260px] min-w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-zinc-200 flex flex-col z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-xs">
          <GitBranch size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight leading-none">
            DevPilot
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            GitHub Analysis Platform
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-4 flex flex-col gap-6 flex-1 overflow-y-auto">
        {/* Core Navigation */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
            Core
          </div>
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer border-none text-left ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} className={isActive ? 'text-zinc-900' : 'text-zinc-400'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-zinc-900" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Analytical Options */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
            Analytical Options
          </div>
          <nav className="flex flex-col gap-1">
            {analyticalPlaceholders.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer border-none text-left ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} className={isActive ? 'text-zinc-900' : 'text-zinc-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-600 rounded px-1.5 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-600 font-medium">
            API Connected
          </span>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          v1.0.0
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
