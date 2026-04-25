"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Patient } from "@/types";
import { getBMIColor, getGlasgowColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useDeletePatient } from "@/hooks/usePatients";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface PatientTableProps {
  patients: Patient[];
}

export default function PatientTable({ patients }: PatientTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    deletePatient(pendingDeleteId, { onSettled: () => setPendingDeleteId(null) });
  };

  const pendingPatient = patients.find((p) => p.id === pendingDeleteId);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900 text-center">
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Patient
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Age
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              BMI
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Glasgow
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Admitted
            </th>
            {user?.role === "doctor" && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {patients.map((patient) => (
            <tr
              key={patient.id}
              onClick={() => router.push(`/patients/${patient.id}`)}
              className="bg-gray-950 hover:bg-gray-900 cursor-pointer transition-colors text-center"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-950 flex items-center justify-center text-xs font-medium text-teal-400 shrink-0">
                    {patient.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="text-gray-200 font-medium">
                    {patient.full_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400">{patient.age} yrs</td>
              <td className="px-4 py-3">
                <span
                  className={`font-medium ${getBMIColor(patient.bmi_category)}`}
                >
                  {patient.bmi.toFixed(1)}
                </span>
                <span className="text-gray-600 text-xs ml-1.5">
                  {patient.bmi_category}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`font-medium ${getGlasgowColor(patient.glasgow_score)}`}
                >
                  {patient.glasgow_score === null
                    ? "N/A"
                    : patient.glasgow_score}
                </span>
                <span className="text-gray-600 text-xs ml-1.5">
                  {patient.glasgow_interpretation}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(patient.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              {user?.role === "doctor" && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleDeleteClick(e, patient.id)}
                    disabled={isDeleting}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {patients.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-600 text-sm">No patients found</p>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete patient"
        description={
          pendingPatient
            ? `Are you sure you want to delete ${pendingPatient.full_name}? This action cannot be undone.`
            : "Are you sure you want to delete this patient? This action cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
