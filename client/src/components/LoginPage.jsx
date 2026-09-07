import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Code2, Search, ArrowRight, GitBranch } from 'lucide-react';

export const LoginPage = () => {
  const { login, loginAsDemoUser } = useAuth();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between px-4 py-8">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex justify-between items-center pb-6 border-b border-zinc-200 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-xs">
            <GitBranch size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            DevPilot
          </span>
        </div>
        <div className="text-sm font-medium text-zinc-500">
          Repository Intelligence System
        </div>
      </header>

      {/* Main Login Container */}
      <main className="w-full max-w-md flex flex-col items-center text-center my-auto">
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-8 shadow-xs">
          {/* GitHub Icon Badge */}
          <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-full inline-flex items-center justify-center mb-6">
            <svg height="28" width="28" viewBox="0 0 16 16" className="fill-zinc-900">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
            Welcome to DevPilot
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed mb-8">
            Connect your GitHub account to analyze repositories, inspect code syntax, and query codebases using AI.
          </p>

          {/* Primary Action Button */}
          <button
            onClick={login}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm py-3 px-5 rounded-lg flex items-center justify-center gap-2.5 transition-colors cursor-pointer mb-3 shadow-xs"
          >
            <svg height="18" width="18" viewBox="0 0 16 16" className="fill-white">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>Connect GitHub to chat with your repository</span>
          </button>

          {/* Secondary Demo Button */}
          <button
            onClick={loginAsDemoUser}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Explore Demo Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 w-full max-w-2xl">
          <div className="border border-zinc-200 rounded-xl p-4 text-left bg-white shadow-2xs">
            <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center mb-3 text-zinc-900">
              <Code2 size={18} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              Multi-Language
            </h3>
            <p className="text-xs text-zinc-500 leading-snug">
              Supports TS, JS, C++, Python, Java, Go, Rust, and more.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-xl p-4 text-left bg-white shadow-2xs">
            <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center mb-3 text-zinc-900">
              <Search size={18} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              Code Q&A
            </h3>
            <p className="text-xs text-zinc-500 leading-snug">
              Query AST structure and ask context-aware repository questions.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-xl p-4 text-left bg-white shadow-2xs">
            <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center mb-3 text-zinc-900">
              <Shield size={18} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              Security Audits
            </h3>
            <p className="text-xs text-zinc-500 leading-snug">
              Automatic SAST scanning and dependency safety checks.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-xs text-zinc-400">
        DevPilot Repository Intelligence Platform &copy; 2026
      </footer>
    </div>
  );
};

export default LoginPage;
