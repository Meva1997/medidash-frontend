"use client";

import { useState } from "react";
import { useAddDiagnosis } from "@/hooks/useConsultations";

export default function AddDiagnosisForm({
  consultationId,
  patientId,
  onClose,
}: {
  consultationId: number;
  patientId: number;
  onClose: () => void;
}) {
  const [description, setDescription] = useState("");
  const { mutate, isPending } = useAddDiagnosis();

  const handleSubmit = () => {
    if (!description.trim()) return;
    mutate(
      { consultationId, patientId, description: description.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg space-y-2 border border-gray-700">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Add diagnosis
      </p>
      <textarea
        className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-gray-600 resize-none"
        rows={2}
        placeholder="Clinical diagnosis description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !description.trim()}
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
