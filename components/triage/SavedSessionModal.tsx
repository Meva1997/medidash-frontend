interface SavedSessionModalProps {
  patientName: string;
  onContinue: () => void;
  onDiscard: () => void;
}

export default function SavedSessionModal({
  patientName,
  onContinue,
  onDiscard,
}: SavedSessionModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          id="session-modal-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
        >
          Unsaved triage found
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          There is an incomplete triage for{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {patientName || "an unknown patient"}
          </span>
          . Do you want to continue or start a new one?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5
                       text-sm font-medium text-slate-600 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            New triage
          </button>
          <button
            onClick={onContinue}
            className="flex-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 px-4 py-2.5
                       text-sm font-semibold text-white transition-colors shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
