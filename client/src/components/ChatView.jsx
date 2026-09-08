import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import useRepos from '../hooks/useRepos';
import { useAuth } from '../context/AuthContext';
import { sendRepoChatMessage } from '../api/client';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Key,
  FileCode,
  ChevronDown,
  ChevronUp,
  Plus,
  GitBranch,
  Layers,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

export const ChatView = () => {
  const { repositories, loading: reposLoading } = useRepos();
  const { connectedRepo, connectRepo } = useAuth();
  
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const messagesEndRef = useRef(null);

  // Set initial selected repo
  useEffect(() => {
    if (connectedRepo) {
      setSelectedRepo(connectedRepo);
    } else if (repositories && repositories.length > 0) {
      setSelectedRepo(repositories[0]);
    }
  }, [connectedRepo, repositories]);

  // Set initial welcome message when selected repo changes
  useEffect(() => {
    if (selectedRepo) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Welcome to **${selectedRepo.name}** AI RAG Chat. Ask any question about this repository's codebase!`,
          sources: [],
          timestamp: new Date(),
        },
      ]);
    }
  }, [selectedRepo?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (queryText) => {
    const text = queryText || input;
    if (!text || !text.trim() || !selectedRepo || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await sendRepoChatMessage(selectedRepo.id, text.trim());
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer || 'No response generated.',
        sources: response.sources || [],
        model: response.model || 'RAG LLM',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        isError: true,
        text: `Error querying RAG assistant: ${err.message || 'Failed to connect to backend service.'}`,
        sources: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSources = (msgId) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const quickPrompts = [
    'Explain the high-level architecture of this codebase.',
    'Where are the main controllers and route handlers defined?',
    'What dependencies and frameworks does this repository rely on?',
    'How is error handling and authentication implemented?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Top Controls Bar */}
      <div className="px-6 py-4 border-b border-zinc-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        {/* Repo Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-semibold text-lg shrink-0">
            <Sparkles size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Repository:</span>
              {reposLoading ? (
                <span className="text-xs text-zinc-400">Loading...</span>
              ) : (
                <select
                  value={selectedRepo ? selectedRepo.id : ''}
                  onChange={(e) => {
                    const r = repositories.find((item) => String(item.id) === e.target.value);
                    if (r) {
                      setSelectedRepo(r);
                      connectRepo(r);
                    }
                  }}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
                >
                  {repositories.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.primary_language || r.language || 'Code'})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              AI RAG Vector Search & Intelligence Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              if (selectedRepo) {
                setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    sender: 'ai',
                    text: `New chat session started for **${selectedRepo.name}**. Ask me any question!`,
                    sources: [],
                    timestamp: new Date(),
                  },
                ]);
              }
            }}
            className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-zinc-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-semibold text-xs text-white ${
                msg.sender === 'user' ? 'bg-zinc-900' : msg.isError ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div className="flex flex-col gap-2">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-none'
                    : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none shadow-2xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  <div className="whitespace-pre-wrap font-sans tracking-tight">
                    {msg.text}
                  </div>
                ) : (
                  <div className="prose prose-xs max-w-none font-sans tracking-tight prose-code:bg-zinc-100 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-pre:bg-zinc-100 prose-pre:text-xs">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Source Context Accordion */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-3 text-[11px]">
                  <button
                    onClick={() => toggleSources(msg.id)}
                    className="flex items-center justify-between w-full text-zinc-600 font-semibold cursor-pointer hover:text-zinc-900"
                  >
                    <div className="flex items-center gap-1.5">
                      <FileCode size={13} className="text-emerald-600" />
                      <span>Retrieved {msg.sources.length} Code Context Snippets</span>
                    </div>
                    {expandedSources[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {expandedSources[msg.id] && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-100 flex flex-col gap-2">
                      {msg.sources.map((src, idx) => (
                        <div key={idx} className="bg-zinc-50 p-2 rounded border border-zinc-200/80 font-mono">
                          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-semibold mb-1">
                            <span className="text-zinc-900 font-bold">{src.filePath}</span>
                            <span className="text-zinc-400">Lines {src.startLine}-{src.endLine}</span>
                          </div>
                          <pre className="text-[10px] text-zinc-700 bg-white p-2 rounded border border-zinc-200 overflow-x-auto whitespace-pre-wrap max-h-32">
                            {src.snippet}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-xs text-zinc-500 flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Searching vector embeddings & generating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-zinc-200 bg-white flex flex-col gap-3 shrink-0">
        {/* Prompt Suggestions */}
        {messages.length <= 2 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              selectedRepo
                ? `Ask a question about ${selectedRepo.name}...`
                : 'Select a repository to chat...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={loading || !selectedRepo}
            className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim() || !selectedRepo}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
