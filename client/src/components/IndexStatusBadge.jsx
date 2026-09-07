import React from 'react';
import { CheckCircle2, RefreshCw, Clock, AlertCircle } from 'lucide-react';

export const IndexStatusBadge = ({ status }) => {
  const normalizedStatus = (status || 'READY').toUpperCase();

  switch (normalizedStatus) {
    case 'READY':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
          <CheckCircle2 size={10} className="text-emerald-600" />
          <span>Ready</span>
        </span>
      );
    case 'INDEXING':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 animate-pulse">
          <RefreshCw size={10} className="animate-spin text-blue-600" />
          <span>Indexing</span>
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
          <Clock size={10} className="text-amber-600" />
          <span>Pending</span>
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
          <AlertCircle size={10} className="text-red-600" />
          <span>Failed</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5">
          <span>{normalizedStatus}</span>
        </span>
      );
  }
};

export default IndexStatusBadge;
