import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-[#247ba0]' : 'bg-[#fb3640]';
  const icon = type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />;

  return (
    <div className="fixed bottom-8 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-lg shadow-black/30 flex items-center gap-3 animate-toast pointer-events-auto max-w-sm w-full`}>
        <div className="shrink-0">
          {icon}
        </div>
        <p className="flex-1 text-sm font-medium leading-tight">
          {message}
        </p>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
          <X className="w-4 h-4 opacity-80" />
        </button>
      </div>
    </div>
  );
};