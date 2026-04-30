import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Drug, InteractionResult } from "@/types";

export function useDrugs() {
  return useQuery<Drug[]>({
    queryKey: ["drugs"],
    queryFn: async () => {
      const { data } = await api.get("/drugs/");
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

export function useCheckInteractions() {
  return useMutation<InteractionResult[], Error, string[]>({
    mutationFn: async (drugNames: string[]) => {
      const { data } = await api.post("/drugs/interactions/", {
        drug_names: drugNames,
      });
      return data.alerts;
    },
  });
}
