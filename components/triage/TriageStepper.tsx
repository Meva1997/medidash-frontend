"use client";

import { cn } from "@/lib/utils";
import { useTriageStore, selectCurrentStep } from "@/store/triageStore";
import { TOTAL_STEPS } from "@/store/triageSchemas";

// ─────────────────────────────────────────────
// Step metadata
// ─────────────────────────────────────────────

const STEPS: { label: string; shortLabel: string }[] = [
  { label: "Patient", shortLabel: "01" },
  { label: "Complaint", shortLabel: "02" },
  { label: "Vitals", shortLabel: "03" },
  { label: "Assessment", shortLabel: "04" },
  { label: "Outcome", shortLabel: "05" },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function TriageStepper() {
  const currentStep = useTriageStore(selectCurrentStep);
  // const isStepValid = useTriageStore((s) => s.isStepValid);
  const goToStep = useTriageStore((s) => s.goToStep);

  return (
    <nav aria-label="Triage steps" className="w-full">
      {/* Progress bar track */}
      <div className="relative mb-6">
        {/* Background track */}
        <div className="absolute top-4.5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

        {/* Filled track — grows with completed steps */}
        <div
          className="absolute top-4.5 left-0 h-0.5 bg-cyan-500 transition-all duration-500 ease-out"
          style={{
            width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%`,
          }}
        />

        {/* Step nodes */}
        <ol className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isReachable = isCompleted || isCurrent;

            return (
              <li key={index} className="flex flex-col items-center gap-2">
                {/* Circle */}
                <button
                  onClick={() => goToStep(index)}
                  disabled={!isReachable}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? " (completed)" : ""}`}
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full",
                    "text-xs font-bold tracking-wider font-mono",
                    "border-2 transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                    // Completed
                    isCompleted && "border-cyan-500 bg-cyan-500 text-white",
                    "cursor-pointer hover:bg-cyan-600 hover:border-cyan-600",

                    // Current
                    isCurrent &&
                      "border-cyan-500 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400",
                    "shadow-[0_0_0_4px_rgba(6,182,212,0.15)]",
                    "cursor-default",

                    // Future
                    !isCompleted &&
                      !isCurrent &&
                      "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900",
                    "text-slate-400 dark:text-slate-500",
                    "cursor-not-allowed",
                  )}
                >
                  {isCompleted ? (
                    // Checkmark for completed steps
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    step.shortLabel
                  )}
                </button>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-wide uppercase",
                    "hidden sm:block",
                    isCurrent
                      ? "text-cyan-600 dark:text-cyan-400"
                      : isCompleted
                        ? "text-slate-500 dark:text-slate-400"
                        : "text-slate-400 dark:text-slate-600",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Current step indicator — mobile */}
      <p className="sm:hidden text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
        Step {currentStep + 1} of {TOTAL_STEPS} —{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {STEPS[currentStep].label}
        </span>
      </p>
    </nav>
  );
}
