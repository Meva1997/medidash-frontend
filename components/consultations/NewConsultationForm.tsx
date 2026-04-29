"use client";

import { useState } from "react";
import { useCreateConsultation } from "@/hooks/useConsultations";

const inputClass =
  "w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-gray-600";

export default function NewConsultationForm({
  patientId,
  onClose,
}: {
  patientId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const { mutate, isPending } = useCreateConsultation();

  const handleSubmit = () => {
    if (!reason.trim()) return;
    mutate(
      { patientId, reason: reason.trim(), notes: notes.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="border border-gray-700 rounded-xl p-4 bg-gray-900 space-y-3 mb-4">
      <p className="text-sm font-medium text-gray-200">New consultation</p>
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
          Reason *
        </label>
        <input
          className={inputClass}
          placeholder="Chief complaint or reason for visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
          Notes
        </label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-gray-600 resize-none"
          rows={2}
          placeholder="Additional clinical notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !reason.trim()}
          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
