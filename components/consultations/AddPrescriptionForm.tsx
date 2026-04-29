"use client";

import { useState } from "react";
import { useAddPrescription } from "@/hooks/useConsultations";
import type { RouteOfAdministration } from "@/types";

const ROUTES: RouteOfAdministration[] = [
  "oral",
  "intravenous",
  "intramuscular",
  "subcutaneous",
  "topical",
  "inhalation",
  "sublingual",
  "rectal",
  "ophthalmic",
  "otic",
];

const inputClass =
  "w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-gray-600";

export default function AddPrescriptionForm({
  consultationId,
  patientId,
  onClose,
}: {
  consultationId: number;
  patientId: number;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    medication_name: "",
    dose: "",
    frequency: "",
    duration: "",
    route: "oral" as RouteOfAdministration,
    instructions: "",
  });
  const { mutate, isPending } = useAddPrescription();

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isValid =
    form.medication_name.trim() &&
    form.dose.trim() &&
    form.frequency.trim() &&
    form.duration.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    mutate(
      {
        consultationId,
        patientId,
        ...form,
        instructions: form.instructions.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg space-y-2 border border-gray-700">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Add prescription
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 mb-0.5 block">
            Medication *
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Acetaminophen"
            value={form.medication_name}
            onChange={set("medication_name")}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-0.5 block">Dose *</label>
          <input
            className={inputClass}
            placeholder="e.g. 500mg"
            value={form.dose}
            onChange={set("dose")}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-0.5 block">
            Frequency *
          </label>
          <input
            className={inputClass}
            placeholder="e.g. every 8 hours"
            value={form.frequency}
            onChange={set("frequency")}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-0.5 block">
            Duration *
          </label>
          <input
            className={inputClass}
            placeholder="e.g. 7 days"
            value={form.duration}
            onChange={set("duration")}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-600 mb-0.5 block">Route</label>
        <select
          className={inputClass}
          value={form.route}
          onChange={set("route")}
        >
          {ROUTES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600 mb-0.5 block">
          Instructions
        </label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-gray-600 resize-none"
          rows={2}
          placeholder="e.g. Take with food"
          value={form.instructions}
          onChange={set("instructions")}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !isValid}
          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
