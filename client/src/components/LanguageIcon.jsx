import React from 'react';

const LANGUAGE_CONFIG = {
  TypeScript: {
    short: 'TS',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-600',
  },
  JavaScript: {
    short: 'JS',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  'C++': {
    short: 'C++',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-600',
  },
  Python: {
    short: 'PY',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    dotClass: 'bg-sky-600',
  },
  Java: {
    short: 'JV',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    dotClass: 'bg-amber-700',
  },
  Go: {
    short: 'GO',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotClass: 'bg-cyan-500',
  },
  Rust: {
    short: 'RS',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-600',
  },
  Ruby: {
    short: 'RB',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-600',
  },
  HTML: {
    short: 'HTML',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-600',
  },
  CSS: {
    short: 'CSS',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-600',
  },
  PHP: {
    short: 'PHP',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-600',
  },
  Shell: {
    short: 'SH',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
  'C#': {
    short: 'C#',
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
    dotClass: 'bg-green-600',
  },
};

const DEFAULT_CONFIG = {
  short: 'CODE',
  badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  dotClass: 'bg-zinc-500',
};

export const LanguageIcon = ({ language, showLabel = true, size = 'md' }) => {
  const langKey = language || 'Unknown';
  const config = LANGUAGE_CONFIG[langKey] || {
    ...DEFAULT_CONFIG,
    short: langKey.substring(0, 3).toUpperCase(),
  };

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center font-mono font-bold border leading-none rounded ${config.badgeClass} ${
          isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dotClass}`} />
        {config.short}
      </span>
      {showLabel && (
        <span className={`font-medium text-zinc-600 ${isSmall ? 'text-xs' : 'text-sm'}`}>
          {langKey}
        </span>
      )}
    </div>
  );
};

export default LanguageIcon;
