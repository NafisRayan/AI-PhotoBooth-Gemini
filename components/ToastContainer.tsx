import React from 'react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';

const Toast: React.FC<{
  toast: {
    id: string;
    message: React.ReactNode;
    type: 'success' | 'error' | 'info';
  };
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const toastVariants = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };

  return (
    <div
      className={cn(
        "relative p-4 mb-2 rounded-md shadow-lg text-white max-w-sm w-full",
        "animate-in slide-in-from-right duration-300",
        toastVariants[toast.type]
      )}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-white/90 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export { ToastContainer };