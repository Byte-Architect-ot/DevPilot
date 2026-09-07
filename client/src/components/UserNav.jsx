import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Key, ChevronDown } from 'lucide-react';

export const UserNav = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const defaultAvatar = 'https://avatars.githubusercontent.com/u/9919?v=4';
  const avatarUrl = user.avatar_url || defaultAvatar;

  return (
    <div className="relative inline-block">
      {/* App Shell User Bar */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
      >
        {/* User Avatar */}
        <img
          src={avatarUrl}
          alt={user.display_name || user.github_username || 'User Avatar'}
          className="w-8 h-8 rounded-full object-cover border border-zinc-200"
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />

        {/* User Info */}
        <div className="text-left flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 leading-tight">
            {user.display_name || user.github_username}
          </span>
          <span className="text-xs text-zinc-500 leading-tight">
            @{user.github_username || 'user'}
          </span>
        </div>

        <ChevronDown size={14} className="text-zinc-400 ml-1" />
      </button>

      {/* User Dropdown */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-50"
          />
          <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 z-51">
            {/* User Profile Header */}
            <div className="flex gap-3 pb-3 border-b border-zinc-200">
              <img
                src={avatarUrl}
                alt={user.display_name || 'User'}
                className="w-11 h-11 rounded-full object-cover border border-zinc-200"
              />
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-zinc-900 truncate">
                  {user.display_name || user.github_username}
                </h4>
                <p className="text-xs text-zinc-500 truncate">
                  @{user.github_username}
                </p>
              </div>
            </div>

            {/* User Credentials */}
            <div className="py-3 flex flex-col gap-2">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                User Credentials
              </div>

              {/* Internal ID */}
              <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 p-2 rounded-md border border-zinc-100">
                <Key size={14} className="text-zinc-400 shrink-0" />
                <span className="font-semibold text-zinc-900">ID:</span>
                <span className="font-mono text-[11px] break-all text-zinc-700">
                  {user.id || 'N/A'}
                </span>
              </div>

              {/* GitHub ID */}
              <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 p-2 rounded-md border border-zinc-100">
                <svg height="14" width="14" viewBox="0 0 16 16" className="fill-zinc-500 shrink-0">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span className="font-semibold text-zinc-900">GitHub ID:</span>
                <span className="font-mono text-xs text-zinc-700">
                  {user.github_id || 'N/A'}
                </span>
              </div>
            </div>

            {/* Logout Action Button */}
            <div className="pt-2 border-t border-zinc-200">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserNav;
