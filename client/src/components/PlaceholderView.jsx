import React from 'react';
import { ShieldCheck, GitPullRequest, Boxes, Settings, Sparkles } from 'lucide-react';

const VIEW_CONFIG = {
  security: {
    title: 'Code Security & SAST Audit',
    subtitle: 'Automated static analysis scanning and vulnerability reporting for repository dependencies.',
    icon: ShieldCheck,
  },
  'pull-requests': {
    title: 'Pull Request Intelligence',
    subtitle: 'Automated code review, diff analysis, and impact assessment for GitHub pull requests.',
    icon: GitPullRequest,
  },
  dependencies: {
    title: 'Dependency Graph Audit',
    subtitle: 'Deep package tree inspection, license compliance verification, and outdated package tracking.',
    icon: Boxes,
  },
  settings: {
    title: 'Workspace Settings',
    subtitle: 'Configure GitHub token permissions, API quotas, indexing schedules, and AI model parameters.',
    icon: Settings,
  },
};

export const PlaceholderView = ({ tabId }) => {
  const config = VIEW_CONFIG[tabId] || {
    title: 'Analytical Tool',
    subtitle: 'Advanced codebase intelligence option.',
    icon: Sparkles,
  };

  const Icon = config.icon;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-10 flex flex-col items-center text-center max-w-2xl mx-auto mt-8 shadow-2xs">
      <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-900 mb-5">
        <Icon size={28} />
      </div>

      <h2 className="text-xl font-bold text-zinc-900 mb-2">
        {config.title}
      </h2>

      <p className="text-sm text-zinc-600 leading-relaxed mb-6">
        {config.subtitle}
      </p>

      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-xs text-zinc-500 w-full flex items-center justify-between">
        <span>Status: Module ready for repository attachment</span>
        <span className="font-semibold text-zinc-900">DevPilot v1.0</span>
      </div>
    </div>
  );
};

export default PlaceholderView;
