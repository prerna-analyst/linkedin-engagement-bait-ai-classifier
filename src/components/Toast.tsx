import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useNotifications();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />,
    info: <Info className="w-5 h-5 text-[#4F8CFF]" />,
    warning: <AlertCircle className="w-5 h-5 text-[#FFD43B]" />,
    drop: <Sparkles className="w-5 h-5 text-[#FFD43B]" />,
  };

  const borders = {
    success: 'border-[#22C55E]/40 bg-[#141821]',
    info: 'border-[#4F8CFF]/40 bg-[#141821]',
    warning: 'border-[#FFD43B]/40 bg-[#141821]',
    drop: 'border-[#FFD43B] bg-[#1C2230]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-md ${
          borders[toast.type] || borders.info
        }`}
      >
        <div className="shrink-0 mt-0.5">{icons[toast.type] || icons.info}</div>
        <div className="flex-1 text-xs text-white leading-relaxed font-medium">
          {toast.message}
        </div>
        <button
          onClick={clearToast}
          className="shrink-0 text-[#A0A8B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
