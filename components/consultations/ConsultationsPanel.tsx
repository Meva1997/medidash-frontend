"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  usePatientConsultations,
  useCreateConsultation,
  useAddDiagnosis,
  useAddPrescription,
} from "@/hooks/useConsultations";
import type { Consultation, RouteOfAdministration } from "@/types";

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

function NewConsultationForm({
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

function AddDiagnosisForm({
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

function AddPrescriptionForm({
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

// ── Consultation card ────────────────────────────────────────────────────────

function ConsultationCard({
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
              <p className="text-sm text-gray-400">{consultation.notes}</p>
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
                <p className="text-sm text-gray-300">{dx.description}</p>
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

export default function ConsultationsPanel({
  patientId,
}: {
  patientId: number;
}) {
  const { user } = useAuth();
  const { data: consultations, isLoading } = usePatientConsultations(patientId);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Consultations
        </h2>
        {user?.role === "doctor" && !showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              fill="currentColor"
              className="w-3.5 h-3.5"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1"
                clipRule="evenodd"
              />
            </svg>
            New consultation
          </button>
        )}
      </div>

      {showNewForm && (
        <NewConsultationForm
          patientId={patientId}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading &&
        (!consultations || consultations.length === 0) &&
        !showNewForm && (
          <div className="border border-gray-800 rounded-xl py-12 text-center">
            <p className="text-gray-600 text-sm">No consultations yet</p>
            {user?.role === "doctor" && (
              <p className="text-gray-700 text-xs mt-1">
                Create one using the button above
              </p>
            )}
          </div>
        )}

      {!isLoading && consultations && consultations.length > 0 && (
        <div className="space-y-3">
          {consultations.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              patientId={patientId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
