'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let listeners: ToastListener[] = [];
let toastsState: ToastItem[] = [];

function notify() {
  listeners.forEach((l) => l([...toastsState]));
}

export const toast = {
  show(message: string, type: ToastType = 'info', duration: number = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, message, type, duration };
    toastsState = [...toastsState, item];
    notify();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },
  success(message: string, duration?: number) {
    return toast.show(message, 'success', duration);
  },
  error(message: string, duration?: number) {
    return toast.show(message, 'error', duration);
  },
  warning(message: string, duration?: number) {
    return toast.show(message, 'warning', duration);
  },
  info(message: string, duration?: number) {
    return toast.show(message, 'info', duration);
  },
  dismiss(id: string) {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  },
  clear() {
    toastsState = [];
    notify();
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: ToastListener = (updated) => {
      setToasts(updated);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2.5 sm:max-w-md"
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              isSuccess
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100 shadow-emerald-500/10'
                : isError
                ? 'border-rose-500/30 bg-rose-950/90 text-rose-100 shadow-rose-500/10'
                : isWarning
                ? 'border-amber-500/30 bg-amber-950/90 text-amber-100 shadow-amber-500/10'
                : 'border-[var(--border-subtle)] bg-background/95 text-foreground shadow-black/20'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
              {isError && <AlertCircle size={18} className="text-rose-400" />}
              {isWarning && <AlertTriangle size={18} className="text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info size={18} className="text-blue-400" />}
            </div>

            <div className="flex-1 text-xs font-bold leading-relaxed">{t.message}</div>

            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              aria-label="Dismiss notification"
              className="mt-0.5 rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default toast;
