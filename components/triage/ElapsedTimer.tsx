"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ElapsedTimerProps {
  arrivalTime: string; // ISO datetime string
  className?: string;
}

function formatElapsed(ms: number): {
  display: string;
  isUrgent: boolean;
  isCritical: boolean;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMin = minutes % 60;

  const display =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(displayMin).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    display,
    isUrgent: minutes >= 10 && minutes < 30,
    isCritical: minutes >= 30,
  };
}

export function ElapsedTimer({ arrivalTime, className }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!arrivalTime) return;

    const arrival = new Date(arrivalTime).getTime();

    const tick = () => setElapsed(Date.now() - arrival);
    tick(); // immediate first tick

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [arrivalTime]);

  const { display, isUrgent, isCritical } = formatElapsed(elapsed);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5",
        "border font-mono text-sm font-semibold tracking-widest",
        "transition-colors duration-500",
        !isUrgent && !isCritical && "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300",
        isUrgent && !isCritical && "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        isCritical && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse",
        className,
      )}
      aria-label={`Time elapsed since patient arrival: ${display}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Dot indicator */}
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          !isUrgent && !isCritical && "bg-slate-400 dark:bg-slate-500",
          isUrgent && !isCritical && "bg-amber-500",
          isCritical && "bg-red-500",
        )}
        aria-hidden="true"
      />

      <span>{display}</span>
    </div>
  );
}
