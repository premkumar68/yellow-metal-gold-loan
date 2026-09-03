import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-xs font-semibold ${
          isSuccess
            ? 'bg-emerald-500/90 text-white border-emerald-400/30'
            : isError
            ? 'bg-rose-500/90 text-white border-rose-400/30'
            : 'bg-slate-900/90 text-white border-slate-700/30'
        }`}
      >
        {isSuccess && <CheckCircle className="w-4 h-4" />}
        {isError && <AlertTriangle className="w-4 h-4" />}
        {!isSuccess && !isError && <Info className="w-4 h-4" />}

        <span>{message}</span>

        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-0.5 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
