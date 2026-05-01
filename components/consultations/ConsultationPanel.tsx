"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePatientConsultations } from "@/hooks/useConsultations";
import NewConsultationForm from "./NewConsultationForm";
import ConsultationCard from "./ConsultationsCard";

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
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Consultations
          </h2>
          {!isLoading && consultations && consultations.length > 0 && (
            <span className="text-xs bg-gray-800 text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">
              {consultations.length}
            </span>
          )}
        </div>
        {user?.role === "doctor" && !showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg fill="currentColor" className="w-3.5 h-3.5" viewBox="0 0 20 20">
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
