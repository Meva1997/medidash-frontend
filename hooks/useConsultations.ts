import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Consultation, RouteOfAdministration } from "@/types";

export function usePatientConsultations(patientId: number) {
  return useQuery<Consultation[]>({
    queryKey: ["consultations", "patient", patientId],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${patientId}/consultations`);
      return data;
    },
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      reason,
      notes,
    }: {
      patientId: number;
      reason: string;
      notes?: string;
    }) => {
      const { data } = await api.post(`/patients/${patientId}/consultations`, {
        reason,
        notes,
      });
      return data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["consultations", "patient", patientId],
      });
    },
  });
}

export function useAddDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      consultationId,
      description,
    }: {
      consultationId: number;
      patientId: number;
      description: string;
    }) => {
      const { data } = await api.post(`/consultations/${consultationId}/diagnoses`, {
        description,
      });
      return data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["consultations", "patient", patientId],
      });
    },
  });
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      consultationId,
      medication_name,
      dose,
      frequency,
      duration,
      route,
      instructions,
    }: {
      consultationId: number;
      patientId: number;
      medication_name: string;
      dose: string;
      frequency: string;
      duration: string;
      route: RouteOfAdministration;
      instructions?: string;
    }) => {
      const { data } = await api.post(`/consultations/${consultationId}/treatments`, {
        medication_name,
        dose,
        frequency,
        duration,
        route,
        instructions,
      });
      return data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["consultations", "patient", patientId],
      });
    },
  });
}
