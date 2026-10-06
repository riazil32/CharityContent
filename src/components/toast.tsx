"use client";

import clsx from "clsx";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tone = "success" | "info" | "error";
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertTriangle : Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex animate-pop items-center gap-2.5 rounded-xl bg-brand-950 px-4 py-3 text-sm text-white shadow-lift"
            >
              <Icon className={clsx("size-4.5 shrink-0", t.tone === "success" && "text-brand-300", t.tone === "error" && "text-coral-400", t.tone === "info" && "text-sky-300")} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
