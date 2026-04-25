import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Patient } from "@/types";

// Custom hooks for managing patients data
export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await api.get("/patients");
      return data;
    },
  });
}

// Hook to fetch a single patient by ID
export function usePatient(id: number) {
  return useQuery<Patient>({
    queryKey: ["patients", id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`);
      return data;
    },
  });
}

// Hook to update a patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        full_name?: string;
        age?: number;
        gender?: string;
        weight_kg?: number;
        height_cm?: number;
        glasgow_score?: number;
      };
    }) => {
      const { data: res } = await api.put(`/patients/${id}`, data);
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients", id] });
    },
  });
}

// Hook to delete a patient
export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
