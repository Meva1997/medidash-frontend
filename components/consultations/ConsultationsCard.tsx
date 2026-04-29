"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Consultation } from "@/types";
import AddDiagnosisForm from "./AddDiagnosisForm";
import AddPrescriptionForm from "./AddPrescriptionForm";
import { formatDateTime } from "@/lib/utils";

export default function ConsultationCard({
  consultation,
  patientId,
}: {
  consultation: Consultation;
  patientId: number;
}) {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const [expanded, setExpanded] = useState(false);
  const [showDxForm, setShowDxForm] = useState(false);
  const [showRxForm, setShowRxForm] = useState(false);

  const activeDiagnoses = consultation.diagnoses.filter((d) => d.is_active);
  const activePrescriptions = consultation.prescriptions.filter(
    (p) => p.is_active,
  );

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium text-gray-200 truncate max-w-xs">
            {consultation.reason}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {new Date(consultation.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-600">
            {activeDiagnoses.length} dx · {activePrescriptions.length} rx
          </span>
          <svg
            fill="currentColor"
            className={`w-4 h-4 text-gray-600 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 py-4 space-y-5 bg-gray-950">
          {/* Notes */}
          {consultation.notes && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                Notes
              </p>
              <div className="flex justify-between">
                <p className="text-sm text-gray-400">{consultation.notes}</p>
                <p className="text-xs text-gray-500">
                  Doctor: {consultation.doctor.full_name}
                </p>
              </div>
            </div>
          )}

          {/* Diagnoses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Diagnoses
              </p>
              {isDoctor && !showDxForm && (
                <button
                  onClick={() => setShowDxForm(true)}
                  className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
                >
                  + Add
                </button>
              )}
            </div>
            {activeDiagnoses.length === 0 && !showDxForm && (
              <p className="text-xs text-gray-700 italic">
                No diagnoses recorded
              </p>
            )}
            {activeDiagnoses.map((dx) => (
              <div
                key={dx.id}
                className="flex items-start gap-2 py-1.5 border-b border-gray-800 last:border-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />

                <div>
                  <p className="text-sm text-gray-300">{dx.description}</p>
                  <div className="flex justify-between w-80">
                    <p className="text-xs text-gray-500">
                      Diagnosed by Dr.{consultation.doctor.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(dx.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {showDxForm && (
              <AddDiagnosisForm
                consultationId={consultation.id}
                patientId={patientId}
                onClose={() => setShowDxForm(false)}
              />
            )}
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Prescriptions
              </p>
              {isDoctor && !showRxForm && (
                <button
                  onClick={() => setShowRxForm(true)}
                  className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
                >
                  + Add
                </button>
              )}
            </div>
            {activePrescriptions.length === 0 && !showRxForm && (
              <p className="text-xs text-gray-700 italic">
                No prescriptions recorded
              </p>
            )}
            {activePrescriptions.map((rx) => (
              <div
                key={rx.id}
                className="py-2 border-b border-gray-800 last:border-0 space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-200">
                    {rx.medication_name}
                  </p>
                  <span className="text-xs text-gray-600 capitalize">
                    {rx.route}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {rx.dose} · {rx.frequency} · {rx.duration}
                </p>
                {rx.instructions && (
                  <p className="text-xs text-gray-600 italic">
                    {rx.instructions}
                  </p>
                )}
              </div>
            ))}
            {showRxForm && (
              <AddPrescriptionForm
                consultationId={consultation.id}
                patientId={patientId}
                onClose={() => setShowRxForm(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
