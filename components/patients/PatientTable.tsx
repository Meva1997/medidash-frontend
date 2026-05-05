"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Patient } from "@/types";
import { getGlasgowColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useDeletePatient } from "@/hooks/usePatients";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface PatientTableProps {
  patients: Patient[];
}

const BMI_META: Record<string, { fill: string; color: string }> = {
  Underweight: { fill: "25%", color: "#60a5fa" },
  Normal: { fill: "50%", color: "#34d399" },
  Overweight: { fill: "72%", color: "#fbbf24" },
  Obese: { fill: "92%", color: "#f87171" },
};

function GlasgowSegments({ score }: { score: number | null }) {
  const normalized = score === null ? 0 : Math.max(0, score - 3) / 12;
  const filled = Math.round(normalized * 5);
  const color =
    score === null
      ? "transparent"
      : score >= 13
        ? "#34d399"
        : score >= 9
          ? "#fbbf24"
          : "#f87171";

  return (
    <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: i < filled ? color : "rgba(255,255,255,0.07)",
            transition: "background-color 0.2s",
          }}
        />
      ))}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export default function PatientTable({ patients }: PatientTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    deletePatient(pendingDeleteId, {
      onSettled: () => setPendingDeleteId(null),
    });
  };

  const pendingPatient = patients.find((p) => p.id === pendingDeleteId);

  return (
    <>
      <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pt-row {
          animation: rowIn 0.3s ease-out both;
          position: relative;
        }

        .pt-row::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, #14b8a6, #0d9488);
          opacity: 0;
          transition: opacity 0.18s ease;
          border-radius: 0 1px 1px 0;
        }

        .pt-row:hover::after { opacity: 1; }

        .pt-delete {
          transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        .pt-delete:hover:not(:disabled) {
          background: rgba(239,68,68,0.16) !important;
          border-color: rgba(239,68,68,0.5) !important;
          box-shadow: 0 0 10px rgba(239,68,68,0.2);
          transform: scale(1.08);
        }

        .pt-delete:active:not(:disabled) {
          transform: scale(0.95);
        }
      `}</style>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(14,17,27,0.96) 0%, rgba(9,12,21,0.99) 100%)",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.015)",
              }}
            >
              {["Patient", "Age", "BMI", "Glasgow", "Admitted"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.13em",
                    color: "rgba(255,255,255,0.22)",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
              {user?.role === "doctor" && <th className="px-5 py-3.5" />}
            </tr>
          </thead>

          <tbody>
            {patients.map((patient, index) => {
              const isHovered = hoveredId === patient.id;
              const bmi = BMI_META[patient.bmi_category] ?? {
                fill: "50%",
                color: "#94a3b8",
              };
              const initials = patient.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <tr
                  key={patient.id}
                  className="pt-row"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  onMouseEnter={() => setHoveredId(patient.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    animationDelay: `${index * 0.045}s`,
                    cursor: "pointer",
                    backgroundColor: isHovered
                      ? "rgba(20,184,166,0.04)"
                      : index % 2 !== 0
                        ? "rgba(255,255,255,0.008)"
                        : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {/* Patient */}
                  <td className="px-5 py-3.5">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          background: isHovered
                            ? "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
                            : "linear-gradient(135deg, #134e4a 0%, #0a3330 100%)",
                          color: isHovered ? "#fff" : "#5eead4",
                          boxShadow: isHovered
                            ? "0 0 0 1.5px rgba(20,184,166,0.5), 0 0 14px rgba(20,184,166,0.2)"
                            : "0 0 0 1px rgba(20,184,166,0.15)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: isHovered ? "#f0fdfc" : "#e2e8f0",
                            transition: "color 0.15s ease",
                            lineHeight: 1.3,
                          }}
                        >
                          {patient.full_name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.18)",
                            marginTop: 2,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          #{patient.id.toString().padStart(4, "0")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Age */}
                  <td className="px-5 py-3.5">
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {patient.age}
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.2)",
                          marginLeft: 3,
                        }}
                      >
                        yr
                      </span>
                    </span>
                  </td>

                  {/* BMI */}
                  <td className="px-5 py-3.5">
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 13,
                            fontWeight: 600,
                            color: bmi.color,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {patient.bmi.toFixed(1)}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.22)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {patient.bmi_category}
                        </span>
                      </div>
                      <div
                        style={{
                          width: 52,
                          height: 2,
                          borderRadius: 1,
                          backgroundColor: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                          marginTop: 6,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: bmi.fill,
                            backgroundColor: bmi.color,
                            opacity: 0.65,
                            borderRadius: 1,
                            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Glasgow */}
                  <td className="px-5 py-3.5">
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              patient.glasgow_score === null
                                ? "rgba(255,255,255,0.18)"
                                : undefined,
                          }}
                          className={
                            patient.glasgow_score !== null
                              ? getGlasgowColor(patient.glasgow_score)
                              : ""
                          }
                        >
                          {patient.glasgow_score === null
                            ? "—"
                            : patient.glasgow_score}
                        </span>
                        {patient.glasgow_score !== null && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.22)",
                              fontFamily: "ui-monospace, monospace",
                            }}
                          >
                            /15
                          </span>
                        )}
                      </div>
                      <GlasgowSegments score={patient.glasgow_score} />
                    </div>
                  </td>

                  {/* Admitted */}
                  <td className="px-5 py-3.5">
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.28)",
                        fontFamily: "ui-monospace, monospace",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {new Date(patient.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </td>

                  {/* Delete */}
                  {user?.role === "doctor" && (
                    <td
                      className="px-5 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <button
                          className="pt-delete"
                          onClick={(e) => handleDeleteClick(e, patient.id)}
                          disabled={isDeleting}
                          title="Delete patient"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            border: "1px solid rgba(239,68,68,0.25)",
                            background: "rgba(239,68,68,0.07)",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {patients.length === 0 && (
          <div
            style={{
              padding: "64px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <UsersIcon />
            </div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              No patients found
            </p>
          </div>
        )}
      </div>

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
    </>
  );
}
