"use client";

import { useRouter } from "next/navigation";
import { Patient, Checklist } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  useCreateChecklist,
  useToggleChecklistItem,
} from "@/hooks/useChecklists";
import { getBMIColor, getGlasgowColor } from "@/lib/utils";

interface PatientProfileProps {
  patient: Patient;
  checklists: Checklist[];
}

export default function PatientProfile({
  patient,
  checklists,
}: PatientProfileProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: createChecklist, isPending: isCreatingChecklist } =
    useCreateChecklist();
  const {
    mutate: toggleChecklistItem,
    isPending: isTogglingItem,
    variables: toggleVariables,
  } = useToggleChecklistItem();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push("/patients")}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-300 transition-colors mb-6"
      >
        <svg fill="currentColor" className="w-4 h-4" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414"
            clipRule="evenodd"
          />
        </svg>
        Back to patients
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-950 flex items-center justify-center text-lg font-medium text-teal-400">
            {patient.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-medium text-gray-100 tracking-tight">
              {patient.full_name}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {patient.age} yrs ·{" "}
              {patient.gender === "M"
                ? "Male"
                : patient.gender === "F"
                  ? "Female"
                  : "Other"}
              · Admitted{" "}
              {new Date(patient.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {user?.role === "doctor" && (
          <button
            onClick={() => createChecklist(patient.id)}
            disabled={isCreatingChecklist}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg fill="currentColor" className="w-4 h-4" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1"
                clipRule="evenodd"
              />
            </svg>
            {isCreatingChecklist ? "Creating..." : "New checklist"}
          </button>
        )}
      </div>

      {/* Clinical stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "BMI",
            value: patient.bmi.toFixed(1),
            sub: patient.bmi_category,
            color: getBMIColor(patient.bmi_category),
          },
          {
            label: "Glasgow score",
            value:
              patient.glasgow_score === null ? "N/A" : patient.glasgow_score,
            sub: patient.glasgow_interpretation,
            color: getGlasgowColor(patient.glasgow_score),
          },
          {
            label: "Weight",
            value: `${patient.weight_kg} kg`,
            sub: null,
            color: "text-gray-300",
          },
          {
            label: "Height",
            value: `${patient.height_cm} cm`,
            sub: null,
            color: "text-gray-300",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
            {stat.sub && (
              <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Checklists */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Surgical checklists
        </h2>

        {checklists.length === 0 ? (
          <div className="border border-gray-800 rounded-xl py-12 text-center">
            <p className="text-gray-600 text-sm">No checklists yet</p>
            {user?.role === "doctor" && (
              <p className="text-gray-700 text-xs mt-1">
                Create one using the button above
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {checklists.map((checklist) => {
              const completed = checklist.items.filter(
                (i) => i.completed,
              ).length;
              const total = checklist.items.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={checklist.id}
                  className="border border-gray-800 rounded-xl overflow-hidden"
                >
                  {/* Checklist header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        Checklist #{checklist.id}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(checklist.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {completed}/{total} completed
                      </span>
                      <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${pct === 100 ? "text-teal-400" : "text-gray-500"}`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-800">
                    {checklist.items.map((item) => {
                      const isThisItemPending =
                        isTogglingItem && toggleVariables?.itemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-900/50 transition-colors"
                        >
                          <button
                            onClick={() =>
                              toggleChecklistItem({
                                checklistId: checklist.id,
                                itemId: item.id,
                                completed: !item.completed,
                              })
                            }
                            disabled={isThisItemPending}
                            className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors disabled:cursor-not-allowed ${
                              item.completed
                                ? "bg-teal-600 border-teal-600"
                                : "border-gray-700 hover:border-gray-500"
                            } ${isThisItemPending ? "opacity-50" : ""}`}
                          >
                            {isThisItemPending ? (
                              <svg
                                fill="none"
                                className="w-2.5 h-2.5 animate-spin text-white"
                                viewBox="0 0 12 12"
                              >
                                <circle
                                  cx="6"
                                  cy="6"
                                  r="4.5"
                                  stroke="currentColor"
                                  strokeDasharray="14"
                                  strokeDashoffset="5"
                                  strokeLinecap="round"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            ) : item.completed ? (
                              <svg
                                fill="none"
                                className="w-2.5 h-2.5"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  stroke="#fff"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="m2 6 3 3 5-5"
                                />
                              </svg>
                            ) : null}
                          </button>
                          <span
                            className={`text-sm flex-1 ${item.completed ? "text-gray-600 line-through" : "text-gray-300"}`}
                          >
                            {item.step}
                          </span>
                          {item.completed_by && (
                            <span className="text-xs text-gray-700 shrink-0">
                              Completed by: {item.completed_by}
                            </span>
                          )}
                          {item.completed_at && (
                            <span className="text-xs text-gray-700 shrink-0">
                              {new Date(item.completed_at).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
