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
  const [rxFormMode, setRxFormMode] = useState<null | "new" | "edit">(null);

  const activeDiagnoses = consultation.diagnoses.filter((d) => d.is_active);
  const activeTreatment =
    consultation.treatments.find((t) => t.is_active) ?? null;
  const historicalTreatments = consultation.treatments
    .filter((t) => !t.is_active)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
            {activeDiagnoses.length} dx ·{" "}
            {activeTreatment?.prescriptions.length ?? 0} rx
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
                      Diagnosed by Dr. {consultation.doctor.full_name}
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
              {isDoctor && rxFormMode === null && (
                <button
                  onClick={() => setRxFormMode("new")}
                  className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
                >
                  + New
                </button>
              )}
            </div>

            {/* Active treatment */}
            {activeTreatment && rxFormMode !== "edit" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">
                    Current · {formatDateTime(activeTreatment.created_at)}
                  </p>
                  {isDoctor && rxFormMode === null && (
                    <button
                      onClick={() => setRxFormMode("edit")}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {activeTreatment.prescriptions.map((rx, i) => (
                  <div key={rx.id} className="flex gap-2 py-0.5">
                    <span className="text-xs text-gray-600 shrink-0 w-4 text-right">
                      {i + 1}.
                    </span>
                    <div>
                      <p className="text-sm text-gray-200">
                        {rx.medication_name}{" "}
                        <span className="font-medium">{rx.dose}</span>{" "}
                        <span className="text-gray-500">
                          · {rx.frequency} · {rx.duration}
                          {rx.route !== "oral" && (
                            <span className="capitalize"> · {rx.route}</span>
                          )}
                        </span>
                      </p>
                      {rx.instructions && (
                        <p className="text-xs text-gray-600 italic mt-0.5">
                          {rx.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit form — replaces active treatment display */}
            {rxFormMode === "edit" && activeTreatment && (
              <AddPrescriptionForm
                consultationId={consultation.id}
                patientId={patientId}
                activeTreatment={activeTreatment}
                onClose={() => setRxFormMode(null)}
              />
            )}

            {/* New treatment form */}
            {rxFormMode === "new" && (
              <AddPrescriptionForm
                consultationId={consultation.id}
                patientId={patientId}
                activeTreatment={null}
                onClose={() => setRxFormMode(null)}
              />
            )}

            {/* Empty state */}
            {activeTreatment === null && rxFormMode === null && (
              <p className="text-xs text-gray-700 italic">
                No prescriptions recorded
              </p>
            )}

            {/* Historical treatments */}
            {historicalTreatments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide">
                  Previous
                </p>
                {historicalTreatments.map((treatment) => (
                  <div key={treatment.id}>
                    <p className="text-xs text-gray-700 mb-1">
                      {formatDateTime(treatment.created_at)}
                    </p>
                    {treatment.prescriptions.map((rx, i) => (
                      <div key={rx.id} className="flex gap-2 py-0.5">
                        <span className="text-xs text-gray-700 shrink-0 w-4 text-right">
                          {i + 1}.
                        </span>
                        <p className="text-xs text-gray-600">
                          {rx.medication_name} {rx.dose} · {rx.frequency} ·{" "}
                          {rx.duration}
                          {rx.route !== "oral" && (
                            <span className="capitalize"> · {rx.route}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
