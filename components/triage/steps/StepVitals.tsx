"use client";

import { useTriageStore, selectVitals } from "@/store/triageStore";
import { cn } from "@/lib/utils";
import {
  VITAL_RANGES,
  getVitalStatus,
  glasgowTotal,
  type VitalStatus,
  type Vitals,
} from "@/types/TriageTypes";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const statusColors: Record<VitalStatus, string> = {
  normal:
    "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  warning:
    "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  critical:
    "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 animate-pulse",
};

// ─────────────────────────────────────────────
// VitalInput — single numeric field with status indicator
// ─────────────────────────────────────────────

function VitalInput({
  id,
  label,
  unit,
  value,
  field,
  placeholder,
  step = 1,
  required = true,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: number | null;
  field?: keyof typeof VITAL_RANGES;
  placeholder?: string;
  step?: number;
  required?: boolean;
  onChange: (v: number | null) => void;
}) {
  const status: VitalStatus | null =
    field && value !== null ? getVitalStatus(field, value) : null;

  const range = field ? VITAL_RANGES[field] : null;

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <input
          id={id}
          type="number"
          step={step}
          placeholder={
            placeholder ?? (range ? `${range.min}–${range.max}` : "")
          }
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? null : parseFloat(e.target.value);
            onChange(isNaN(v as number) ? null : v);
          }}
          className={cn(
            "w-full rounded-lg border pr-12 pl-3.5 py-2.5 text-sm font-mono",
            "bg-white dark:bg-slate-800",
            "text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
            "transition-colors duration-150",
            status
              ? statusColors[status]
              : "border-slate-200 dark:border-slate-700",
          )}
          aria-describedby={status ? `${id}-status` : undefined}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">
          {unit}
        </span>
      </div>

      {/* Status badge */}
      {status && status !== "normal" && value !== null && (
        <p
          id={`${id}-status`}
          className={cn(
            "text-xs font-medium",
            status === "warning"
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {status === "warning" ? "⚠ Out of normal range" : "🔴 Critical value"}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Pain scale slider
// ─────────────────────────────────────────────

function PainScaleInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const painColor =
    value === null
      ? "text-slate-400"
      : value <= 3
        ? "text-emerald-600 dark:text-emerald-400"
        : value <= 6
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="painScale"
          className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
        >
          Pain scale
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <span
          className={cn("text-xl font-bold tabular-nums font-mono", painColor)}
        >
          {value ?? "–"} / 10
        </span>
      </div>
      <input
        id="painScale"
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 0}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-cyan-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>No pain</span>
        <span>Moderate</span>
        <span>Worst</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Glasgow selector
// ─────────────────────────────────────────────

function GlasgowSelector<T extends number>({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
      >
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => {
          const v =
            e.target.value === "" ? null : (parseInt(e.target.value) as T);
          onChange(v);
        }}
        className={cn(
          "w-full rounded-lg border px-3 py-2.5 text-sm",
          "bg-white dark:bg-slate-800",
          "border-slate-200 dark:border-slate-700",
          "text-slate-900 dark:text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
        )}
      >
        <option value="">— Select —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.value} — {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function StepVitals() {
  const vitals = useTriageStore(selectVitals);
  const updateVitals = useTriageStore((s) => s.updateVitals);

  const gcs = glasgowTotal(vitals);
  const gcsColor =
    gcs === null
      ? "text-slate-400"
      : gcs >= 13
        ? "text-emerald-600 dark:text-emerald-400"
        : gcs >= 9
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Vital Signs
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Record the patient&apos;s current vital signs. Fields marked * are
          required.
        </p>
      </div>

      {/* ── Hemodynamics ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Hemodynamics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <VitalInput
            id="heartRate"
            label="Heart rate"
            unit="bpm"
            field="heartRate"
            value={vitals.heartRate}
            onChange={(v) => updateVitals({ heartRate: v })}
          />
          <VitalInput
            id="systolicBP"
            label="Systolic BP"
            unit="mmHg"
            field="systolicBP"
            value={vitals.systolicBP}
            onChange={(v) => updateVitals({ systolicBP: v })}
          />
          <VitalInput
            id="diastolicBP"
            label="Diastolic BP"
            unit="mmHg"
            field="diastolicBP"
            value={vitals.diastolicBP}
            required={false}
            onChange={(v) => updateVitals({ diastolicBP: v })}
          />
        </div>
      </section>

      {/* ── Anthropometry ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Anthropometry
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <VitalInput
            id="weightKg"
            label="Weight"
            unit="kg"
            field="weightKg"
            value={vitals.weightKg}
            placeholder="70"
            step={0.1}
            onChange={(v) => updateVitals({ weightKg: v })}
          />
          <VitalInput
            id="heightCm"
            label="Height"
            unit="cm"
            field="heightCm"
            value={vitals.heightCm}
            placeholder="170"
            onChange={(v) => updateVitals({ heightCm: v })}
          />
        </div>
      </section>

      {/* ── Respiratory & Temperature ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Respiratory & Temperature
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <VitalInput
            id="respiratoryRate"
            label="Resp. rate"
            unit="rpm"
            field="respiratoryRate"
            value={vitals.respiratoryRate}
            onChange={(v) => updateVitals({ respiratoryRate: v })}
          />
          <VitalInput
            id="spO2"
            label="SpO₂"
            unit="%"
            field="spO2"
            value={vitals.spO2}
            onChange={(v) => updateVitals({ spO2: v })}
          />
          <VitalInput
            id="temperature"
            label="Temperature"
            unit="°C"
            field="temperature"
            step={0.1}
            placeholder="36.5"
            value={vitals.temperature}
            onChange={(v) => updateVitals({ temperature: v })}
          />
        </div>
      </section>

      {/* ── Metabolic ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Metabolic (optional)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <VitalInput
            id="glucoseCapillary"
            label="Capillary glucose"
            unit="mg/dL"
            field="glucoseCapillary"
            value={vitals.glucoseCapillary}
            required={false}
            onChange={(v) => updateVitals({ glucoseCapillary: v })}
          />
        </div>
      </section>

      {/* ── Pain scale ── */}
      <section>
        <h3 className="mb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Pain
        </h3>
        <PainScaleInput
          value={vitals.painScale}
          onChange={(v) => updateVitals({ painScale: v })}
        />
      </section>

      {/* ── Glasgow ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Glasgow Coma Scale
          </h3>
          {gcs !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total:
              </span>
              <span className={cn("text-lg font-bold font-mono", gcsColor)}>
                {gcs}
                <span className="text-xs font-normal text-slate-400">/15</span>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GlasgowSelector<1 | 2 | 3 | 4>
            id="glasgowOcular"
            label="Ocular (E)"
            value={vitals.glasgowOcular}
            onChange={(v) => updateVitals({ glasgowOcular: v })}
            options={[
              { value: 4, label: "Spontaneous" },
              { value: 3, label: "To voice" },
              { value: 2, label: "To pain" },
              { value: 1, label: "None" },
            ]}
          />
          <GlasgowSelector<1 | 2 | 3 | 4 | 5>
            id="glasgowVerbal"
            label="Verbal (V)"
            value={vitals.glasgowVerbal}
            onChange={(v) => updateVitals({ glasgowVerbal: v })}
            options={[
              { value: 5, label: "Oriented" },
              { value: 4, label: "Confused" },
              { value: 3, label: "Inappropriate" },
              { value: 2, label: "Incomprehensible" },
              { value: 1, label: "None" },
            ]}
          />
          <GlasgowSelector<1 | 2 | 3 | 4 | 5 | 6>
            id="glasgowMotor"
            label="Motor (M)"
            value={vitals.glasgowMotor}
            onChange={(v) => updateVitals({ glasgowMotor: v })}
            options={[
              { value: 6, label: "Obeys commands" },
              { value: 5, label: "Localizes pain" },
              { value: 4, label: "Withdraws" },
              { value: 3, label: "Flexion" },
              { value: 2, label: "Extension" },
              { value: 1, label: "None" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
