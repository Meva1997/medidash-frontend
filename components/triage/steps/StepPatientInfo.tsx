"use client";

import { useTriageStore, selectPatient } from "@/store/triageStore";
import { cn } from "@/lib/utils";
import type { BiologicalSex } from "@/types/TriageTypes";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
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

const inputBase = cn(
  "w-full rounded-lg border px-3.5 py-2.5 text-sm",
  "bg-white dark:bg-slate-800",
  "border-slate-200 dark:border-slate-700",
  "text-slate-900 dark:text-slate-100",
  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
  "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
  "transition-colors duration-150",
);

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function StepPatientInfo() {
  const patient = useTriageStore(selectPatient);
  const updatePatient = useTriageStore((s) => s.updatePatient);

  const sexOptions: { value: BiologicalSex; label: string }[] = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
  ];

  // Format ISO datetime to local datetime-local value (using local time, not UTC)
  const arrivalLocalValue = patient.arrivalTime
    ? (() => {
        const d = new Date(patient.arrivalTime);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })()
    : "";

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Patient Identification
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter the patient&apos;s basic information to begin the triage
          assessment.
        </p>
      </div>

      {/* Full name */}
      <div>
        <FieldLabel htmlFor="fullName" required>
          Full name
        </FieldLabel>
        <input
          id="fullName"
          type="text"
          autoComplete="off"
          autoFocus
          placeholder="e.g. María García López"
          value={patient.fullName}
          onChange={(e) => updatePatient({ fullName: e.target.value })}
          className={inputBase}
        />
      </div>

      {/* Birth date + Sex — 2-col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Birth date */}
        <div>
          <FieldLabel htmlFor="birthDate" required>
            Date of birth
          </FieldLabel>
          <input
            id="birthDate"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={patient.birthDate}
            onChange={(e) => updatePatient({ birthDate: e.target.value })}
            className={inputBase}
          />
        </div>

        {/* Biological sex */}
        <div>
          <FieldLabel htmlFor="biologicalSex" required>
            Biological sex
          </FieldLabel>
          <div
            id="biologicalSex"
            role="group"
            aria-label="Biological sex"
            className="flex gap-2"
          >
            {sexOptions.map(({ value, label }) => {
              const selected = patient.biologicalSex === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updatePatient({ biologicalSex: value })}
                  aria-pressed={selected}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium",
                    "transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                    selected
                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Arrival time */}
      <div>
        <FieldLabel htmlFor="arrivalTime" required>
          Arrival time
        </FieldLabel>
        <input
          id="arrivalTime"
          type="datetime-local"
          value={arrivalLocalValue}
          onChange={(e) =>
            updatePatient({
              arrivalTime: new Date(e.target.value).toISOString(),
            })
          }
          className={inputBase}
        />
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          Auto-filled with the current time. Adjust if needed.
        </p>
      </div>
    </div>
  );
}
