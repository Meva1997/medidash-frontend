"use client";
import Link from "next/link";

export default function SubmitSuccessTriage({
  triageId,
  patientName,
  onReset,
}: {
  triageId: string;
  patientName: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <svg
          fill="none"
          aria-hidden="true"
          className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
          />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Triage complete
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {patientName} — ID{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {triageId}
          </span>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="rounded-lg bg-cyan-500 hover:bg-cyan-600 px-6 py-3
                     text-sm font-semibold text-white transition-colors shadow-sm"
        >
          Start new triage
        </button>
        <Link
          href="/patients"
          className="rounded-lg border border-slate-300 dark:border-slate-700 px-6 py-3
                     text-sm font-semibold text-slate-700 dark:text-slate-300
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Go to patients
        </Link>
      </div>
    </div>
  );
}
