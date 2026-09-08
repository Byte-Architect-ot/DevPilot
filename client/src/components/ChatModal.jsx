import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendRepoChatMessage } from '../api/client';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Key,
  FileCode,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ChatModal = ({ repo, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am DevPilot AI. Ask me anything about **${repo.name}**. I will retrieve relevant code context from the repository and generate an accurate answer.`,
      sources: [],
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (queryText) => {
    const messageToSend = queryText || input;
    if (!messageToSend || !messageToSend.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await sendRepoChatMessage(repo.id, messageToSend.trim());
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
        text: `Error: ${err.message || 'Failed to query repository RAG service.'}`,
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
    'Explain the high-level architecture of this repository.',
    'Where are the main entry points or controllers?',
    'What dependencies or libraries does this project use?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-semibold text-lg shadow-xs">
              <Sparkles size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Chat with {repo.name}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md text-zinc-600">
                  {repo.default_branch || repo.defaultBranch || 'main'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                AI RAG Retrieval & Intelligence Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-zinc-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${
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
                    <div className="prose prose-xs max-w-none text-zinc-800 font-sans tracking-tight prose-code:bg-zinc-100 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-pre:bg-zinc-100 prose-pre:text-xs">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Retrieved Context Sources (AI messages) */}
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
                <span>Searching vector embeddings & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer & Input */}
        <div className="p-4 border-t border-zinc-200 bg-white flex flex-col gap-3 shrink-0">
          {/* Quick Prompts */}
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

          {/* Text Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Ask a question about ${repo.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
