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
          viewBox="0 0 24 24"
          fill="none"
          className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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

      <button
        onClick={onReset}
        className="rounded-lg bg-cyan-500 hover:bg-cyan-600 px-6 py-3
                   text-sm font-semibold text-white transition-colors shadow-sm"
      >
        Start new triage
      </button>
    </div>
  );
}
