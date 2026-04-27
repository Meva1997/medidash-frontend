export type Role = "doctor" | "nurse";

export interface User {
  id: number;
  email: string;
  full_name: string;
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
  description: string;
  severity: "High" | "Moderate" | "Low";
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

export type RouteOfAdministration =
  | "oral"
  | "intravenous"
  | "intramuscular"
  | "subcutaneous"
  | "topical"
  | "inhalation"
  | "sublingual"
  | "rectal"
  | "ophthalmic"
  | "otic";

export interface Diagnosis {
  id: number;
  consultation_id: number;
  description: string;
  created_at: string;
  diagnosed_by_id: number;
  is_active: boolean;
  superseded_at: string | null;
  original_id: number | null;
}

export interface Prescription {
  id: number;
  consultation_id: number;
  medication_name: string;
  dose: string;
  frequency: string;
  duration: string;
  route: RouteOfAdministration;
  instructions: string | null;
  prescribed_at: string;
  prescribed_by_id: number;
  is_active: boolean;
  superseded_at: string | null;
  original_id: number | null;
}

export interface Consultation {
  id: number;
  patient_id: number;
  doctor_id: number;
  reason: string;
  notes: string | null;
  created_at: string;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
}
