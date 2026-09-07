import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings, Shield, RefreshCw, Key, Save } from 'lucide-react';

export const SettingsView = () => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [syncFrequency, setSyncFrequency] = useState('hourly');
  const [autoIndex, setAutoIndex] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    showSuccess('Workspace settings saved successfully');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">
          Settings & Configuration
        </h1>
        <p className="text-sm text-zinc-600">
          Manage repository indexing frequencies, connected GitHub credentials, and workspace preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* GitHub Account Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900">
              <svg height="18" width="18" viewBox="0 0 16 16" className="fill-zinc-900">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Connected GitHub Account
              </h2>
              <p className="text-xs text-zinc-500">
                OAuth authentication state and user details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5">
              <span className="text-xs text-zinc-500 font-medium block mb-1">
                Display Name
              </span>
              <span className="text-sm font-semibold text-zinc-900">
                {user?.display_name || user?.github_username || 'N/A'}
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5">
              <span className="text-xs text-zinc-500 font-medium block mb-1">
                GitHub Handle
              </span>
              <span className="text-sm font-semibold text-zinc-900">
                @{user?.github_username || 'N/A'}
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5">
              <span className="text-xs text-zinc-500 font-medium block mb-1">
                Internal User ID
              </span>
              <span className="text-xs font-mono text-zinc-800 break-all">
                {user?.id || 'N/A'}
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5">
              <span className="text-xs text-zinc-500 font-medium block mb-1">
                GitHub ID
              </span>
              <span className="text-xs font-mono text-zinc-800">
                {user?.github_id || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Indexing Preferences Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900">
              <RefreshCw size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Repository Sync & Indexing
              </h2>
              <p className="text-xs text-zinc-500">
                Configure background sync intervals and AST parsing behavior.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-2">
                Automatic Sync Frequency
              </label>
              <select
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
              >
                <option value="hourly">Every 1 Hour (Recommended)</option>
                <option value="daily">Every 24 Hours</option>
                <option value="manual">Manual Sync Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div>
                <span className="text-sm font-semibold text-zinc-900 block">
                  Automatic Code Indexing
                </span>
                <span className="text-xs text-zinc-500">
                  Parse AST syntax trees automatically when new commits are detected.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoIndex}
                onChange={(e) => setAutoIndex(e.target.checked)}
                className="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm py-2.5 px-6 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
