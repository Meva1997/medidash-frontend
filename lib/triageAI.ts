import api from "@/lib/api";
import type {
  AITriageSuggestRequest,
  AITriageSuggestResponse,
} from "@/types/TriageTypes";

export async function fetchTriageAssessment(
  payload: AITriageSuggestRequest,
): Promise<AITriageSuggestResponse> {
  const { data } = await api.post<AITriageSuggestResponse>(
    "/triage/ai-suggest",
    payload,
  );
  return data;
}
