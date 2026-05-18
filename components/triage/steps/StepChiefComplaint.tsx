"use client";

import { useTriageStore, selectComplaint } from "@/store/triageStore";
import { cn } from "@/lib/utils";
import { MTS_CATEGORY_LABELS, type MTSCategory } from "@/types/TriageTypes";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
    >
      {children}
      {required && (
        <span
          className="ml-1 text-red-500 dark:text-red-400"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  );
}

// ─────────────────────────────────────────────
// Category grid
// ─────────────────────────────────────────────

const CATEGORY_ICONS: Partial<Record<MTSCategory, string>> = {
  chest_pain: "🫀",
  breathing_difficulty: "🫁",
  abdominal_pain: "🔴",
  trauma: "🩹",
  headache: "🧠",
  fever_adult: "🌡️",
  fever_child: "👶",
  altered_consciousness: "⚠️",
  seizure: "⚡",
  allergic_reaction: "🤧",
  urological_pain: "💧",
  back_pain: "🦴",
  limb_injury: "🦾",
  self_harm: "🆘",
  psychiatric: "💬",
  other: "📋",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function StepChiefComplaint() {
  const complaint = useTriageStore(selectComplaint);
  const updateComplaint = useTriageStore((s) => s.updateComplaint);

  const categories = Object.entries(MTS_CATEGORY_LABELS) as [
    MTSCategory,
    string,
  ][];

  const handleCategorySelect = (cat: MTSCategory) => {
    updateComplaint({ mtsCategory: cat });
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Chief Complaint
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Describe the patient&apos;s main symptom and select the most
          appropriate MTS category.
        </p>
      </div>

      {/* Free-text complaint */}
      <div>
        <FieldLabel htmlFor="rawText" required>
          Patient&apos;s complaint
        </FieldLabel>
        <textarea
          id="rawText"
          rows={3}
          autoFocus
          placeholder="Describe the patient's symptoms in your own words…"
          value={complaint.rawText}
          onChange={(e) => updateComplaint({ rawText: e.target.value })}
          className={cn(
            "w-full rounded-lg border px-3.5 py-2.5 text-sm resize-none",
            "bg-white dark:bg-slate-800",
            "border-slate-200 dark:border-slate-700",
            "text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
            "transition-colors duration-150",
          )}
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 text-right">
          {complaint.rawText.length} / 10 min characters
        </p>
      </div>

      {/* MTS Category grid */}
      <div>
        <FieldLabel required>MTS Category</FieldLabel>

        {/* AI suggestion banner */}
        {complaint.aiSuggestedCategory && (
          <div
            className={cn(
              "mb-3 flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
              "border border-cyan-200 dark:border-cyan-800",
              "bg-cyan-50 dark:bg-cyan-900/20 text-sm",
            )}
          >
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <svg
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16m0 3a1 1 0 0 1 1 1v3.586l2.707 2.707a1 1 0 0 1-1.414 1.414l-3-3A1 1 0 0 1 9 10V6a1 1 0 0 1 1-1" />
              </svg>
              <span>
                AI suggestion:{" "}
                <strong>
                  {MTS_CATEGORY_LABELS[complaint.aiSuggestedCategory]}
                </strong>
              </span>
            </div>
            {complaint.mtsCategory !== complaint.aiSuggestedCategory && (
              <button
                type="button"
                onClick={() => {
                  updateComplaint({
                    mtsCategory: complaint.aiSuggestedCategory,
                    aiSuggestionAccepted: true,
                  });
                }}
                className="shrink-0 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Accept
              </button>
            )}
          </div>
        )}

        <div
          role="radiogroup"
          aria-label="MTS Category"
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {categories.map(([value, label]) => {
            const selected = complaint.mtsCategory === value;
            const isSuggested = complaint.aiSuggestedCategory === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleCategorySelect(value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                  selected
                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-medium"
                    : isSuggested
                      ? "border-cyan-300 dark:border-cyan-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
              >
                <span className="text-base shrink-0" aria-hidden="true">
                  {CATEGORY_ICONS[value] ?? "📋"}
                </span>
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
