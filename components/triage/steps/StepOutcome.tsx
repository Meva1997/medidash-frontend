"use client";

import {
  useTriageStore,
  selectOutcome,
  selectAssessment,
  selectPatient,
} from "@/store/triageStore";
import { cn } from "@/lib/utils";
import { MTS_COLOR_META } from "@/types/TriageTypes";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function StepOutcome() {
  const outcome = useTriageStore(selectOutcome);
  const assessment = useTriageStore(selectAssessment);
  const patient = useTriageStore(selectPatient);
  const updateOutcome = useTriageStore((s) => s.updateOutcome);

  const finalColor = assessment.finalColor;
  const colorMeta = finalColor ? MTS_COLOR_META[finalColor] : null;

  const COLOR_BADGE: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-300 dark:border-red-700",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-300 dark:border-yellow-700",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-300 dark:border-emerald-700",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-300 dark:border-blue-700",
    },
  };

  const badge = finalColor ? COLOR_BADGE[finalColor] : null;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Patient Outcome
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Assign a destination and complete the triage assessment.
        </p>
      </div>

      {/* ── Triage summary card ── */}
      {finalColor && badge && colorMeta && (
        <div
          className={cn(
            "rounded-xl border-2 px-5 py-4 flex items-center justify-between gap-4",
            badge.border,
            badge.bg,
          )}
        >
          <div>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-widest",
                badge.text,
              )}
            >
              Triage result
            </p>
            <p className={cn("text-2xl font-bold mt-0.5", badge.text)}>
              {colorMeta.label}
            </p>
            <p className={cn("text-sm opacity-75 mt-0.5", badge.text)}>
              {colorMeta.description}
              {colorMeta.maxWaitMin !== null &&
                ` — max wait ${colorMeta.maxWaitMin === 0 ? "immediate" : `${colorMeta.maxWaitMin} min`}`}
            </p>
          </div>
          <div
            className={cn(
              "h-14 w-14 shrink-0 rounded-full border-4",
              badge.border,
              `bg-${finalColor === "green" ? "emerald" : finalColor}-500`,
              "opacity-90",
            )}
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── Destination ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Patient destination
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </h3>
        <div
          className="grid grid-cols-2 gap-3"
          role="group"
          aria-label="Patient destination"
        >
          {/* Waiting room */}
          <button
            type="button"
            onClick={() =>
              updateOutcome({
                destination: "waiting_room",
                censusPatientId: null,
              })
            }
            aria-pressed={outcome.destination === "waiting_room"}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
              outcome.destination === "waiting_room"
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
            )}
          >
            <svg
              fill="none"
              aria-hidden="true"
              className={cn(
                "h-8 w-8",
                outcome.destination === "waiting_room"
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-400 dark:text-slate-500",
              )}
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m11 4 2 2-2 2m4-2h-6"
              />
            </svg>
            <span
              className={cn(
                "text-sm font-semibold",
                outcome.destination === "waiting_room"
                  ? "text-cyan-700 dark:text-cyan-300"
                  : "text-slate-600 dark:text-slate-400",
              )}
            >
              Waiting room
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Patient waits for their turn
            </span>
          </button>

          {/* Census / Admit */}
          <button
            type="button"
            onClick={() => updateOutcome({ destination: "census" })}
            aria-pressed={outcome.destination === "census"}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
              outcome.destination === "census"
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
            )}
          >
            <svg
              fill="none"
              aria-hidden="true"
              className={cn(
                "h-8 w-8",
                outcome.destination === "census"
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-400 dark:text-slate-500",
              )}
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 22V12h6v10"
              />
            </svg>
            <span
              className={cn(
                "text-sm font-semibold",
                outcome.destination === "census"
                  ? "text-cyan-700 dark:text-cyan-300"
                  : "text-slate-600 dark:text-slate-400",
              )}
            >
              Admit to census
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Assign to a specific room
            </span>
          </button>
        </div>

        {/* Census patient ID */}
        {outcome.destination === "census" && (
          <div className="mt-3">
            <label
              htmlFor="censusPatientId"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Room / census ID
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="censusPatientId"
              type="text"
              autoFocus
              placeholder="e.g. Room 4B, Trauma Bay 2…"
              value={outcome.censusPatientId ?? ""}
              onChange={(e) =>
                updateOutcome({
                  censusPatientId: e.target.value || null,
                })
              }
              className={cn(
                "w-full rounded-lg border px-3.5 py-2.5 text-sm",
                "bg-white dark:bg-slate-800",
                "border-slate-200 dark:border-slate-700",
                "text-slate-900 dark:text-slate-100",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
              )}
            />
          </div>
        )}
      </section>

      {/* ── Notes ── */}
      <section>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Additional notes{" "}
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            (optional)
          </span>
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Any additional observations, allergies, relevant history…"
          value={outcome.notes}
          onChange={(e) => updateOutcome({ notes: e.target.value })}
          className={cn(
            "w-full rounded-lg border px-3.5 py-2.5 text-sm resize-none",
            "bg-white dark:bg-slate-800",
            "border-slate-200 dark:border-slate-700",
            "text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
          )}
        />
      </section>

      {/* ── Badge print toggle ── */}
      <section>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Print triage badge
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Patient wristband will be printed after submission
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={outcome.badgePrinted}
            onClick={() =>
              updateOutcome({ badgePrinted: !outcome.badgePrinted })
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
              "transition-colors duration-200 ease-in-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
              outcome.badgePrinted
                ? "bg-cyan-500"
                : "bg-slate-200 dark:bg-slate-700",
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow",
                "transition-transform duration-200 ease-in-out",
                "mt-0.5",
                outcome.badgePrinted ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </section>

      {/* ── Patient summary ── */}
      <section className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
          Review
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Patient</dt>
          <dd className="text-slate-700 dark:text-slate-300 font-medium">
            {patient.fullName || "—"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Arrival</dt>
          <dd className="text-slate-700 dark:text-slate-300">
            {patient.arrivalTime
              ? new Date(patient.arrivalTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </dd>
          {assessment.nurseOverride && (
            <>
              <dt className="text-slate-500 dark:text-slate-400 col-span-2 mt-1 text-xs ">
                ⚠ Nurse override applied
              </dt>
            </>
          )}
        </dl>
      </section>
    </div>
  );
}
