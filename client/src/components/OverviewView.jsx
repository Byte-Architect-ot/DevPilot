import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  Code,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import LanguageIcon from './LanguageIcon';

export const OverviewView = ({ onNavigateToRepos }) => {
  const { user } = useAuth();

  const metrics = [
    {
      title: 'Indexed Repositories',
      value: '8',
      change: '+2 this week',
      icon: FolderGit2,
    },
    {
      title: 'Supported Languages',
      value: '13',
      change: 'TS, JS, C++, PY, JV...',
      icon: Code,
    },
    {
      title: 'AST Nodes Parsed',
      value: '1.2M',
      change: '99.4% syntax accuracy',
      icon: Layers,
    },
    {
      title: 'AI Queries Handled',
      value: '142',
      change: 'Avg response <1.2s',
      icon: Sparkles,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      repo: 'devpilot-core',
      language: 'TypeScript',
      action: 'Full repository re-indexed',
      time: '12 minutes ago',
    },
    {
      id: 2,
      repo: 'backend-services',
      language: 'Java',
      action: 'Security & Dependency audit scan completed',
      time: '1 hour ago',
    },
    {
      id: 3,
      repo: 'native-parser',
      language: 'C++',
      action: 'AST tree construction finished (14,200 symbols)',
      time: '3 hours ago',
    },
    {
      id: 4,
      repo: 'rust-security-scanner',
      language: 'Rust',
      action: 'SAST compliance check passed',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">
            Repository Overview
          </h1>
          <p className="text-sm text-zinc-600">
            Welcome back, {user?.display_name || user?.github_username}. Here is the current status of your indexed codebases.
          </p>
        </div>

        <button
          onClick={onNavigateToRepos}
          className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <span>View All Repositories</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between shadow-2xs"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-zinc-500">
                  {item.title}
                </span>
                <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-900">
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900 tracking-tight leading-none">
                  {item.value}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  {item.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Language Breakdown */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs lg:col-span-1">
          <h3 className="text-base font-semibold text-zinc-900 mb-1">
            Language Ecosystem
          </h3>
          <p className="text-xs text-zinc-500 mb-5">
            Primary programming languages detected across repositories.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <LanguageIcon language="TypeScript" />
              <span className="text-xs font-semibold text-zinc-900">38%</span>
            </div>
            <div className="flex justify-between items-center">
              <LanguageIcon language="Java" />
              <span className="text-xs font-semibold text-zinc-900">24%</span>
            </div>
            <div className="flex justify-between items-center">
              <LanguageIcon language="C++" />
              <span className="text-xs font-semibold text-zinc-900">16%</span>
            </div>
            <div className="flex justify-between items-center">
              <LanguageIcon language="Python" />
              <span className="text-xs font-semibold text-zinc-900">12%</span>
            </div>
            <div className="flex justify-between items-center">
              <LanguageIcon language="Go" />
              <span className="text-xs font-semibold text-zinc-900">6%</span>
            </div>
            <div className="flex justify-between items-center">
              <LanguageIcon language="Rust" />
              <span className="text-xs font-semibold text-zinc-900">4%</span>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-zinc-900">
              Recent Analysis Logs
            </h3>
            <span className="text-xs text-zinc-500">Real-time updates</span>
          </div>

          <div className="flex flex-col gap-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-900">
                        {activity.repo}
                      </span>
                      <LanguageIcon language={activity.language} showLabel={false} size="sm" />
                    </div>
                    <span className="text-xs text-zinc-600">
                      {activity.action}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs shrink-0">
                  <Clock size={12} />
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
