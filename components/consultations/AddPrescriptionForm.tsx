"use client";

import { useState } from "react";
import {
  useAddPrescription,
  useUpdateTreatment,
} from "@/hooks/useConsultations";
import type { RouteOfAdministration, Treatment } from "@/types";

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

type PrescriptionRow = {
  medication_name: string;
  dose: string;
  frequency: string;
  duration: string;
  route: RouteOfAdministration;
  instructions: string;
};

const empty = (): PrescriptionRow => ({
  medication_name: "",
  dose: "",
  frequency: "",
  duration: "",
  route: "oral",
  instructions: "",
});

export default function AddPrescriptionForm({
  consultationId,
  patientId,
  activeTreatment,
  onClose,
}: {
  consultationId: number;
  patientId: number;
  activeTreatment: Treatment | null;
  onClose: () => void;
}) {
  const isEditing = activeTreatment !== null;

  const [rows, setRows] = useState<PrescriptionRow[]>(
    isEditing
      ? activeTreatment.prescriptions.map((p) => ({
          medication_name: p.medication_name,
          dose: p.dose,
          frequency: p.frequency,
          duration: p.duration,
          route: p.route,
          instructions: p.instructions ?? "",
        }))
      : [empty()],
  );
  const [serverError, setServerError] = useState("");

  const { mutate: addTreatment, isPending: isAdding } = useAddPrescription();
  const { mutate: updateTreatment, isPending: isUpdating } =
    useUpdateTreatment();
  const isPending = isAdding || isUpdating;

  const updateRow =
    (index: number, key: keyof PrescriptionRow) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setRows((prev) =>
        prev.map((row, i) =>
          i === index ? { ...row, [key]: e.target.value } : row,
        ),
      );

  const addRow = () => setRows((prev) => [...prev, empty()]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const isValid = rows.every(
    (p) =>
      p.medication_name.trim() &&
      p.dose.trim() &&
      p.frequency.trim() &&
      p.duration.trim(),
  );

  const handleSubmit = () => {
    if (!isValid) return;
    setServerError("");

    const prescriptions = rows.map((p) => ({
      ...p,
      instructions: p.instructions.trim() || undefined,
    }));

    const onError = (error: unknown) => {
      const msg = (error as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setServerError(msg ?? "Failed to save. Please try again.");
    };

    if (isEditing) {
      updateTreatment(
        {
          consultationId,
          patientId,
          treatmentId: activeTreatment.id,
          prescriptions,
        },
        { onSuccess: onClose, onError },
      );
    } else {
      addTreatment(
        { consultationId, patientId, prescriptions },
        { onSuccess: onClose, onError },
      );
    }
  };

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg space-y-3 border border-gray-700">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {isEditing ? "Edit prescription" : "New prescription"}
      </p>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="space-y-2">
            {index > 0 && <div className="border-t border-gray-700 pt-1" />}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {index + 1}.
              </span>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  Medication *
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Acetaminophen"
                  value={row.medication_name}
                  onChange={updateRow(index, "medication_name")}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  Dose *
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. 500mg"
                  value={row.dose}
                  onChange={updateRow(index, "dose")}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  Frequency *
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. every 8 hours"
                  value={row.frequency}
                  onChange={updateRow(index, "frequency")}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  Duration *
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. 7 days"
                  value={row.duration}
                  onChange={updateRow(index, "duration")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  Route
                </label>
                <select
                  className={inputClass}
                  value={row.route}
                  onChange={updateRow(index, "route")}
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
                <input
                  className={inputClass}
                  placeholder="e.g. Take with food"
                  value={row.instructions}
                  onChange={updateRow(index, "instructions")}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
      >
        + Add another medication
      </button>

      {serverError && (
        <p className="text-xs text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

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
