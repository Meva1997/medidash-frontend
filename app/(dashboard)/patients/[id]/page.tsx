"use client";

import { use } from "react";
import { usePatient } from "@/hooks/usePatients";
import { usePatientChecklists } from "@/hooks/useChecklists";
import PatientProfile from "@/components/patients/PatientProfile";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientPage({ params }: PatientPageProps) {
  const { id } = use(params);
  const patientId = parseInt(id);

  const {
    data: patient,
    isLoading: loadingPatient,
    isError,
  } = usePatient(patientId); //fetch patient data
  const { data: checklists, isLoading: loadingChecklists } =
    usePatientChecklists(patientId); //fetch checklists for the patient

  const isLoading = loadingPatient || loadingChecklists;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400 text-sm">Patient not found.</p>
      </div>
    );
  }

  return <PatientProfile patient={patient} checklists={checklists ?? []} />;
}
