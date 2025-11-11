import React from 'react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn'; // Assuming cn utility is available

const Toast: React.FC<{ toast: { id: string; message: React.ReactNode; type: 'success' | 'error' | 'info'; }; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[toast.type];

  return (
    <div
      className={cn(
        "relative p-4 mb-2 rounded-md shadow-lg text-white max-w-sm w-full animate-fade-in-up transition-opacity duration-300 ease-out",
        bgColor
      )}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-white opacity-90 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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