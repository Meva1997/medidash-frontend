export type Role = "doctor" | "nurse";

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface Patient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  glasgow_score: number;
  bmi: number;
  bmi_category: string;
  glasgow_interpretation: string;
}

export interface Drug {
  id: number;
  name: string;
}

export interface InteractionResult {
  drug_a: string;
  drug_b: string;
  severity: string;
  description: string;
}

export interface ChecklistItem {
  id: number;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Checklist {
  id: number;
  patient_id: number;
  created_at: string;
  items: ChecklistItem[];
}
