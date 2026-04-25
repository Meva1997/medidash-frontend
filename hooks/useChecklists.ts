import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Checklist } from "@/types";

//fetch checklists for a specific patient
export function usePatientChecklists(patientId: number) {
  return useQuery<Checklist[]>({
    queryKey: ["checklists", "patient", patientId],
    queryFn: async () => {
      const { data } = await api.get(`/checklists/patient/${patientId}`);
      return data;
    },
  });
}

//create a new surgical checklist for a patient
export function useCreateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patientId: number) => {
      const { data } = await api.post(`/checklists`, { patient_id: patientId });
      return data;
    },
    onSuccess: (_, patientId) => {
      queryClient.invalidateQueries({
        queryKey: ["checklists", "patient", patientId],
      });
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      checklistId,
      itemId,
      completed,
    }: {
      checklistId: number;
      itemId: number;
      completed: boolean;
    }) => {
      const { data } = await api.patch(
        `/checklists/${checklistId}/items/${itemId}`,
        {
          completed,
        },
      );
      return data;
    },

    onSuccess: (_, { checklistId }) => {
      queryClient.invalidateQueries({
        queryKey: ["checklists", checklistId],
      });
      queryClient.invalidateQueries({
        queryKey: ["checklists", "patient"],
      });
    },
  });
}
