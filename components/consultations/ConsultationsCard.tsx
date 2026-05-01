"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Consultation } from "@/types";
import AddDiagnosisForm from "./AddDiagnosisForm";
import AddPrescriptionForm from "./AddPrescriptionForm";
import PrescriptionItem from "./PrescriptionItem";
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
  const [showHistory, setShowHistory] = useState(false);

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
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-900 hover:bg-gray-800/80 transition-colors text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-teal-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-100 truncate max-w-xs">
              {consultation.reason}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDateTime(consultation.created_at)} · Dr.{" "}
              {consultation.doctor.full_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {activeDiagnoses.length > 0 && (
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">
              {activeDiagnoses.length} dx
            </span>
          )}
          {(activeTreatment?.prescriptions.length ?? 0) > 0 && (
            <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full px-2 py-0.5">
              {activeTreatment?.prescriptions.length} rx
            </span>
          )}
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
        <div className="bg-gray-950 divide-y divide-gray-800/50">
          {/* Notes */}
          {consultation.notes && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Notes
              </p>
              <div className="border-l-2 border-gray-700 bg-gray-900/50 rounded-r-lg px-3 py-2.5">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {consultation.notes}
                </p>
              </div>
            </div>
          )}

          {/* Diagnoses */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Diagnoses
                </p>
              </div>
              {isDoctor && !showDxForm && (
                <button
                  onClick={() => setShowDxForm(true)}
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/40 px-2.5 py-1 rounded-md transition-colors"
                >
                  <svg
                    fill="currentColor"
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add
                </button>
              )}
            </div>

            {activeDiagnoses.length === 0 && !showDxForm && (
              <p className="text-xs text-gray-700 italic">
                No diagnoses recorded
              </p>
            )}

            <div className="space-y-2">
              {activeDiagnoses.map((dx) => (
                <div
                  key={dx.id}
                  className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200">{dx.description}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatDateTime(dx.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {showDxForm && (
              <AddDiagnosisForm
                consultationId={consultation.id}
                patientId={patientId}
                onClose={() => setShowDxForm(false)}
              />
            )}
          </div>

          {/* Prescriptions */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Prescriptions
                </p>
              </div>
              {isDoctor && rxFormMode === null && (
                <button
                  onClick={() => setRxFormMode("new")}
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/40 px-2.5 py-1 rounded-md transition-colors"
                >
                  <svg
                    fill="currentColor"
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1"
                      clipRule="evenodd"
                    />
                  </svg>
                  New
                </button>
              )}
            </div>

            {/* Active treatment — visually prominent */}
            {activeTreatment && rxFormMode !== "edit" && (
              <div className="border border-teal-500/30 bg-teal-500/5 rounded-lg overflow-hidden mb-3">
                <div className="flex items-center justify-between px-3 py-2 bg-teal-500/10 border-b border-teal-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      Current Treatment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {formatDateTime(activeTreatment.created_at)}
                    </span>
                    {isDoctor && rxFormMode === null && (
                      <button
                        onClick={() => setRxFormMode("edit")}
                        className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <svg
                          fill="currentColor"
                          className="w-3 h-3"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379z" />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-3 py-2 divide-y divide-teal-500/10">
                  {activeTreatment.prescriptions.map((rx, i) => (
                    <PrescriptionItem
                      key={rx.id}
                      rx={rx}
                      index={i}
                      consultationId={consultation.id}
                      treatmentId={activeTreatment.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Edit form */}
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
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 uppercase tracking-wider font-medium transition-colors"
                >
                  <svg
                    fill="currentColor"
                    className={`w-3 h-3 transition-transform ${showHistory ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous treatments ({historicalTreatments.length})
                </button>
                {showHistory &&
                  historicalTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="border border-gray-800 rounded-lg overflow-hidden"
                    >
                      <div className="px-3 py-1.5 bg-gray-900/40 border-b border-gray-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0" />
                        <span className="text-xs text-gray-500">
                          {formatDateTime(treatment.created_at)}
                        </span>
                      </div>
                      <div className="px-3 py-2 space-y-1">
                        {treatment.prescriptions.map((rx, i) => (
                          <div key={rx.id} className="flex gap-2 py-0.5">
                            <span className="text-xs text-gray-600 shrink-0 w-4 text-right font-mono">
                              {i + 1}.
                            </span>
                            <p className="text-xs text-gray-400">
                              <span className="font-medium text-gray-300">
                                {rx.medication_name}
                              </span>{" "}
                              {rx.dose} · {rx.frequency} · {rx.duration}
                              {rx.route !== "oral" && (
                                <span className="capitalize">
                                  {" "}
                                  · {rx.route}
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
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
