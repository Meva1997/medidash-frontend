"use client";

import { cn } from "@/lib/utils";
import { TOTAL_STEPS } from "@/store/triageSchemas";

interface StepNavigationProps {
  currentStep: number;
  canAdvance: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export function StepNavigation({
  currentStep,
  canAdvance,
  isSubmitting,
  onNext,
  onPrev,
  onSubmit,
}: StepNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
      {/* Back button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2.5",
          "text-sm font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
          isFirstStep
            ? "invisible" // hide but preserve layout space
            : "border border-slate-200 dark:border-slate-700",
          "text-slate-600 dark:text-slate-300",
          "hover:bg-slate-50 dark:hover:bg-slate-800",
          "active:scale-[0.98]",
        )}
        aria-label="Go to previous step"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      {/* Step counter — center */}
      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
        {currentStep + 1} / {TOTAL_STEPS}
      </span>

      {/* Next / Submit button */}
      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canAdvance || isSubmitting}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5",
            "text-sm font-semibold transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
            "active:scale-[0.98]",
            canAdvance && !isSubmitting
              ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed",
          )}
          aria-label="Submit triage"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              Complete triage
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5",
            "text-sm font-semibold transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
            "active:scale-[0.98]",
            canAdvance
              ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed",
          )}
          aria-label="Go to next step"
        >
          Continue
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
