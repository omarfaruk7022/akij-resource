'use client';
// src/components/ui/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { create } from 'zustand';

// Toast store
export const useToastStore = create((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper functions
export const toast = {
  success: (message, duration = 4000) => useToastStore.getState().add({ type: 'success', message, duration }),
  error: (message, duration = 5000) => useToastStore.getState().add({ type: 'error', message, duration }),
  warning: (message, duration = 4000) => useToastStore.getState().add({ type: 'warning', message, duration }),
  info: (message, duration = 4000) => useToastStore.getState().add({ type: 'info', message, duration }),
};

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  warning: 'border-l-4 border-yellow-500',
  info: 'border-l-4 border-blue-500',
};

function ToastItem({ toast: t }) {
  const remove = useToastStore((s) => s.remove);

  useEffect(() => {
    if (t.duration) {
      const timer = setTimeout(() => remove(t.id), t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.id, t.duration, remove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 bg-white rounded-xl shadow-lg px-4 py-3 min-w-[280px] max-w-sm',
        styles[t.type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
      <p className="flex-1 text-sm text-gray-700 font-medium">{t.message}</p>
      <button
        onClick={() => remove(t.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 mt-0.5 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
