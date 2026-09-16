"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
  tone: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, tone?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

// A real, app-wide confirmation system — most actions (post, delete, edit,
// save, copy) previously gave no feedback beyond a silent state change,
// which is a big part of why the app read as static. One shared queue so
// every action gets the same brief, dismissing-itself confirmation instead
// of each component inventing its own inline "Saved!" text.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.75rem)] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            // bg-ink-text-header flips from near-black to near-white between
            // themes, which left white toast text unreadable in dark mode —
            // pin the success tone to a fixed dark shade instead so white
            // text stays legible in both themes.
            className={`animate-toast-in max-w-[calc(100vw-2rem)] rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-xl ${
              toast.tone === "error" ? "bg-ink-red" : "bg-[#1c2218]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
