"use client";

import {
  useTriageStore,
  selectAssessment,
  selectComplaint,
  selectVitals,
  selectPatient,
} from "@/store/triageStore";
import { cn } from "@/lib/utils";
import {
  MTS_COLOR_META,
  type TriageColor,
  type MTSDiscriminator,
} from "@/types/TriageTypes";

// ─────────────────────────────────────────────
// MTS discriminators per category
// In production these come from the AI response;
// here we provide sensible static defaults as fallback.
// ─────────────────────────────────────────────

const DISCRIMINATORS_BY_CATEGORY: Record<string, MTSDiscriminator[]> = {
  chest_pain: [
    {
      id: "cp_airway",
      question: "Is the airway compromised?",
      pointsToColor: "red",
    },
    {
      id: "cp_shock",
      question: "Signs of circulatory shock?",
      pointsToColor: "red",
    },
    {
      id: "cp_severe_pain",
      question: "Severe, unbearable pain (VAS ≥ 8)?",
      pointsToColor: "orange",
    },
    {
      id: "cp_radiation",
      question: "Pain radiates to arm, jaw, or back?",
      pointsToColor: "orange",
    },
    {
      id: "cp_diaphoresis",
      question: "Diaphoresis or cold sweats?",
      pointsToColor: "orange",
    },
  ],
  breathing_difficulty: [
    {
      id: "bd_airway",
      question: "Complete airway obstruction?",
      pointsToColor: "red",
    },
    {
      id: "bd_cyanosis",
      question: "Central cyanosis or SpO₂ < 90%?",
      pointsToColor: "red",
    },
    {
      id: "bd_retractions",
      question: "Visible supraclavicular retractions?",
      pointsToColor: "orange",
    },
    {
      id: "bd_stridor",
      question: "Stridor or significant wheeze?",
      pointsToColor: "orange",
    },
  ],
  altered_consciousness: [
    {
      id: "ac_unresponsive",
      question: "Patient unresponsive (GCS ≤ 8)?",
      pointsToColor: "red",
    },
    { id: "ac_gcs", question: "GCS < 13?", pointsToColor: "orange" },
    {
      id: "ac_agitation",
      question: "Severe agitation or confusion?",
      pointsToColor: "orange",
    },
  ],
  seizure: [
    { id: "sz_ongoing", question: "Currently seizing?", pointsToColor: "red" },
    {
      id: "sz_postictal",
      question: "Reduced consciousness post-seizure?",
      pointsToColor: "orange",
    },
    {
      id: "sz_fever",
      question: "Associated with fever > 38.5°C?",
      pointsToColor: "yellow",
    },
  ],
  trauma: [
    { id: "tr_airway", question: "Airway compromise?", pointsToColor: "red" },
    {
      id: "tr_hemorrhage",
      question: "Major uncontrolled hemorrhage?",
      pointsToColor: "red",
    },
    {
      id: "tr_fracture",
      question: "Suspected long bone fracture?",
      pointsToColor: "orange",
    },
    {
      id: "tr_headinjury",
      question: "Head injury with altered consciousness?",
      pointsToColor: "orange",
    },
  ],
  // Fallback for all other categories
  default: [
    {
      id: "gen_airway",
      question: "Is the airway compromised?",
      pointsToColor: "red",
    },
    {
      id: "gen_shock",
      question: "Signs of circulatory shock?",
      pointsToColor: "red",
    },
    {
      id: "gen_severe_pain",
      question: "Severe pain (VAS ≥ 8)?",
      pointsToColor: "orange",
    },
    {
      id: "gen_distress",
      question: "Significant physiological distress?",
      pointsToColor: "orange",
    },
    {
      id: "gen_vitals",
      question: "Critical vital signs?",
      pointsToColor: "orange",
    },
  ],
};

// ─────────────────────────────────────────────
// Color badge
// ─────────────────────────────────────────────

const COLOR_STYLES: Record<
  TriageColor,
  { bg: string; text: string; border: string; dot: string }
> = {
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
    dot: "bg-red-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-700",
    dot: "bg-orange-500",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
    dot: "bg-yellow-500",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
  },
};

function ColorBadge({
  color,
  selected,
  onClick,
}: {
  color: TriageColor;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = MTS_COLOR_META[color];
  const styles = COLOR_STYLES[color];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
        selected
          ? cn(styles.border, styles.bg)
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
      )}
    >
      <span
        className={cn("h-4 w-4 rounded-full", styles.dot)}
        aria-hidden="true"
      />
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          selected ? styles.text : "text-slate-500 dark:text-slate-400",
        )}
      >
        {meta.label}
      </span>
      {meta.maxWaitMin !== null && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {meta.maxWaitMin === 0 ? "Now" : `≤ ${meta.maxWaitMin}m`}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function StepAIAssessment() {
  const assessment = useTriageStore(selectAssessment);
  const complaint = useTriageStore(selectComplaint);
  const updateAssessment = useTriageStore((s) => s.updateAssesment);

  const discriminators =
    DISCRIMINATORS_BY_CATEGORY[complaint.mtsCategory ?? ""] ??
    DISCRIMINATORS_BY_CATEGORY.default;

  const handleDiscriminatorChange = (id: string, value: boolean | null) => {
    updateAssessment({
      discriminators: { ...assessment.discriminators, [id]: value },
    });
  };

  const allAnswered = discriminators.every(
    (d) => assessment.discriminators[d.id] !== undefined,
  );

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          MTS Assessment
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Answer the discriminator questions, then assign the final triage
          color.
        </p>
      </div>

      {/* ── AI recommendation banner ── */}
      {assessment.aiRecommendedColor && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3.5",
            COLOR_STYLES[assessment.aiRecommendedColor].border,
            COLOR_STYLES[assessment.aiRecommendedColor].bg,
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 rounded-full",
                COLOR_STYLES[assessment.aiRecommendedColor].dot,
              )}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold",
                  COLOR_STYLES[assessment.aiRecommendedColor].text,
                )}
              >
                AI recommendation:{" "}
                {MTS_COLOR_META[assessment.aiRecommendedColor].label}
                {assessment.aiConfidence !== null && (
                  <span className="ml-2 text-xs font-normal opacity-75">
                    ({Math.round(assessment.aiConfidence * 100)}% confidence)
                  </span>
                )}
              </p>
              {assessment.aiRationale && (
                <p
                  className={cn(
                    "mt-1 text-xs opacity-80",
                    COLOR_STYLES[assessment.aiRecommendedColor].text,
                  )}
                >
                  {assessment.aiRationale}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Discriminators ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Discriminator questions
        </h3>
        <div className="space-y-2">
          {discriminators.map((disc) => {
            const answer = assessment.discriminators[disc.id];
            const styles = COLOR_STYLES[disc.pointsToColor];

            return (
              <div
                key={disc.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg border px-4 py-3",
                  "transition-colors duration-150",
                  answer === true
                    ? cn(styles.bg, styles.border)
                    : "border-slate-200 dark:border-slate-700",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", styles.dot)}
                    aria-hidden="true"
                  />
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                    {disc.question}
                  </p>
                </div>

                <div
                  className="flex gap-1.5 shrink-0"
                  role="group"
                  aria-label={disc.question}
                >
                  {(
                    [
                      { val: true, label: "Yes" },
                      { val: false, label: "No" },
                    ] as const
                  ).map(({ val, label }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => handleDiscriminatorChange(disc.id, val)}
                      aria-pressed={answer === val}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-semibold",
                        "transition-all duration-100",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                        answer === val
                          ? val === true
                            ? cn(
                                styles.text,
                                styles.bg,
                                "border",
                                styles.border,
                              )
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {!allAnswered && (
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Answer all questions to enable AI-assisted color recommendation.
          </p>
        )}
      </section>

      {/* ── Final color ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Final triage color
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </h3>
        <div
          className="flex gap-2"
          role="group"
          aria-label="Final triage color"
        >
          {(["red", "orange", "yellow", "green", "blue"] as TriageColor[]).map(
            (color) => (
              <ColorBadge
                key={color}
                color={color}
                selected={assessment.finalColor === color}
                onClick={() => updateAssessment({ finalColor: color })}
              />
            ),
          )}
        </div>

        {assessment.finalColor && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {MTS_COLOR_META[assessment.finalColor].description} —{" "}
            {assessment.finalColor === "red"
              ? "Immediate attention"
              : `Max wait: ${MTS_COLOR_META[assessment.finalColor].maxWaitMin} minutes`}
          </p>
        )}
      </section>

      {/* ── Nurse override reason ── */}
      {assessment.nurseOverride && (
        <section>
          <label
            htmlFor="overrideReason"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Reason for overriding AI recommendation
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="overrideReason"
            rows={2}
            placeholder="Explain why you chose a different triage color than the AI recommended…"
            value={assessment.nurseOverrideReason}
            onChange={(e) =>
              updateAssessment({ nurseOverrideReason: e.target.value })
            }
            className={cn(
              "w-full rounded-lg border px-3.5 py-2.5 text-sm resize-none",
              "bg-white dark:bg-slate-800",
              "border-amber-300 dark:border-amber-700",
              "text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
            )}
          />
        </section>
      )}
    </div>
  );
}
