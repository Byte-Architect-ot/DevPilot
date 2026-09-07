import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border bg-white shadow-lg transition-all duration-200 ${
                isSuccess
                  ? 'border-emerald-200 text-emerald-950'
                  : isError
                  ? 'border-red-200 text-red-950'
                  : isWarning
                  ? 'border-amber-200 text-amber-950'
                  : 'border-zinc-200 text-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                {isError && <AlertCircle size={18} className="text-red-600 shrink-0" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-600 shrink-0" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info size={18} className="text-blue-600 shrink-0" />
                )}
                <span className="text-xs font-medium leading-snug">
                  {toast.message}
                </span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-700 ml-3 shrink-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
