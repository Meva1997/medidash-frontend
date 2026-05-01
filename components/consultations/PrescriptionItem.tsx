"use client";
import { useState } from "react";
import type { Prescription } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { usePrescriptionHistory } from "@/hooks/useConsultations";

export default function PrescriptionItem({
  rx,
  index,
  consultationId,
  treatmentId,
}: {
  rx: Prescription;
  index: number;
  consultationId: number;
  treatmentId: number;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const { data: history, isLoading } = usePrescriptionHistory(
    consultationId,
    treatmentId,
    rx.id,
    showHistory,
  );

  const hasHistory = rx.original_id !== null;

  return (
    <div className="py-2">
      <div className="flex gap-3 items-start">
        <span className="text-xs text-teal-600 font-mono shrink-0 w-5 text-right mt-0.5">
          {index + 1}.
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-100 leading-snug">
              <span className="font-semibold">{rx.medication_name}</span>{" "}
              <span className="text-teal-300 font-bold">{rx.dose}</span>{" "}
              <span className="text-gray-500">
                · {rx.frequency} · {rx.duration}
                {rx.route !== "oral" && (
                  <span className="capitalize"> · {rx.route}</span>
                )}
              </span>
            </p>
            {hasHistory && (
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <svg
                  fill="currentColor"
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16m1-12a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.415-1.415L11 9.586z"
                    clipRule="evenodd"
                  />
                </svg>
                {showHistory ? "Hide" : "View edits"}
              </button>
            )}
          </div>

          {rx.instructions && (
            <p className="text-xs text-gray-500 italic mt-0.5">
              {rx.instructions}
            </p>
          )}
          <p className="text-xs text-gray-700 mt-0.5">
            By Dr. {rx.prescribed_by.full_name} ·{" "}
            {formatDateTime(rx.prescribed_at)}
          </p>

          {showHistory && (
            <div className="mt-2 pl-3 border-l-2 border-amber-500/30 bg-amber-500/5 rounded-r py-2 pr-2 space-y-2">
              {isLoading ? (
                <p className="text-xs text-gray-600">Loading…</p>
              ) : history && history.length > 0 ? (
                history.map((old) => (
                  <div key={old.id}>
                    <p className="text-xs text-gray-600 line-through">
                      {old.medication_name} {old.dose} · {old.frequency} ·{" "}
                      {old.duration}
                      {old.route !== "oral" && (
                        <span className="capitalize"> · {old.route}</span>
                      )}
                    </p>
                    {old.instructions && (
                      <p className="text-xs text-gray-700 italic line-through">
                        {old.instructions}
                      </p>
                    )}
                    <p className="text-xs text-amber-600/70 mt-0.5">
                      Edited by Dr. {old.superseded_by?.full_name ?? "unknown"}
                      {old.superseded_at && (
                        <> · {formatDateTime(old.superseded_at)}</>
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-700 italic">No history</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
