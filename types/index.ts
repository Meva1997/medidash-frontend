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
  gender: "male" | "female" | "other";
  weight_kg: number;
  height_cm: number;
  glasgow_score: number;
  created_at: string; // agrega esto
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
  step: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string;
}

export interface Checklist {
  id: number;
  patient_id: number;
  created_at: string;
  created_by: number;
  notes: string | null;
  items: ChecklistItem[];
}
