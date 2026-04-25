"use client";

import { useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/context/AuthContext";
import PatientTable from "@/components/patients/PatientTable";
import PatientForm from "@/components/patients/PatientForm";
import { Patient } from "@/types";

export default function PatientsPage() {
  const { data: patients, isLoading, isError } = usePatients();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered =
    patients?.filter((p: Patient) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-gray-100 tracking-tight">
            Patient census
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {patients?.length ?? 0} active patients
          </p>
        </div>
        {user?.role === "doctor" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg fill="currentColor" className="w-4 h-4" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1"
                clipRule="evenodd"
              />
            </svg>
            Admit patient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="py-8 text-center">
          <p className="text-red-400 text-sm">
            Failed to load patients. Check your connection.
          </p>
        </div>
      )}

      {!isLoading && !isError && <PatientTable patients={filtered} />}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-base font-medium text-gray-100">
                Admit new patient
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-300 transition-colors"
              >
                <svg
                  fill="currentColor"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <PatientForm onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
