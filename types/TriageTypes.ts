// ─────────────────────────────────────────────
// MTS Triage Color Scale
// ─────────────────────────────────────────────

export type TriageColor =
  | "red" // Immediate       — vital risk, immediate attention
  | "orange" // Really Urgent    — ≤ 10 min
  | "yellow" // Urgent         // ≤ 60 min
  | "green" // Less urgent    — ≤ 120 min
  | "blue"; // Non urgent      — ≤ 240 min

export const MTS_COLOR_META: Record<
  TriageColor,
  { label: string; maxWaitMin: number | null; description: string }
> = {
  red: {
    label: "Immediate",
    maxWaitMin: 0,
    description: "Vital risk immediate",
  },
  orange: {
    label: "Really urgent",
    maxWaitMin: 10,
    description: "Elevated situation risk",
  },
  yellow: {
    label: "Urgent",
    maxWaitMin: 60,
    description: "Stable condition but urgent",
  },
  green: {
    label: "Less urgent",
    maxWaitMin: 120,
    description: "No immediate risk",
  },
  blue: {
    label: "Non urgent",
    maxWaitMin: 240,
    description: "No urgent problem",
  },
};

// ─────────────────────────────────────────────
// MTS Categories (chief complaint discriminators)
// ─────────────────────────────────────────────

export type MTSCategory =
  | "chest_pain"
  | "breathing_difficulty"
  | "abdominal_pain"
  | "trauma"
  | "headache"
  | "fever_adult"
  | "fever_child"
  | "altered_consciousness"
  | "seizure"
  | "allergic_reaction"
  | "urological_pain"
  | "back_pain"
  | "limb_injury"
  | "self_harm"
  | "psychiatric"
  | "other";

export const MTS_CATEGORY_LABELS: Record<MTSCategory, string> = {
  chest_pain: "Chest Pain",
  breathing_difficulty: "Breathinf difficulty",
  abdominal_pain: "Abdominal pain",
  trauma: "Trauma / injury",
  headache: "Headache",
  fever_adult: "Fever (adult)",
  fever_child: "Fever (child)",
  altered_consciousness: "Altered consciousness",
  seizure: "Seizure",
  allergic_reaction: "Allergic reaction",
  urological_pain: "Urological pain",
  back_pain: "Back pain",
  limb_injury: "Limb injury",
  self_harm: "Self harm / suicide intent",
  psychiatric: "Psychiatric crisis",
  other: "Other",
};

// ─────────────────────────────────────────────
// Step 1 — Patient Identification
// ─────────────────────────────────────────────

export type BiologicalSex = "M" | "F" | "O";

export interface PatientInfo {
  fullName: string;
  birthDate: string; // ISO date string: "YYYY-MM-DD"
  biologicalSex: BiologicalSex | null;
  arrivalTime: string; // ISO datetime string, auto-complete
}

// ─────────────────────────────────────────────
// Step 2 — Consult visit
// ─────────────────────────────────────────────

export interface ChiefComplaint {
  rawText: string; // nurse free text
  mtsCategory: MTSCategory | null; // AI suggested, confirmed by nurse
  aiSuggestedCategory: MTSCategory | null; // original model suggestion (read-only)
  aiSuggestionAccepted: boolean; // did the nurse accept the suggestion?
}

// ─────────────────────────────────────────────
// Step 3 — Vital Signs
// ─────────────────────────────────────────────

export interface Vitals {
  heartRate: number | null; // bpm
  respiratoryRate: number | null; // rpm
  systolicBP: number | null; // mmHg
  diastolicBP: number | null; // mmHg
  temperature: number | null; // °C
  spO2: number | null; // %
  glucoseCapillary: number | null; // mg/dL — optional
  painScale: number | null; // 0–10
  glasgowOcular: 1 | 2 | 3 | 4 | null;
  glasgowVerbal: 1 | 2 | 3 | 4 | 5 | null;
  glasgowMotor: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

// Glasgow total computed, not stored
export function glasgowTotal(v: Vitals): number | null {
  if (
    v.glasgowOcular === null ||
    v.glasgowVerbal === null ||
    v.glasgowMotor === null
  )
    return null;
  return v.glasgowOcular + v.glasgowVerbal + v.glasgowMotor;
}

// Normal ranges per field for inline validation
export const VITAL_RANGES: Record<
  keyof Omit<Vitals, "glasgowOcular" | "glasgowVerbal" | "glasgowMotor">,
  { min: number; max: number; criticalMin?: number; criticalMax?: number }
> = {
  heartRate: { min: 60, max: 100, criticalMin: 40, criticalMax: 150 },
  respiratoryRate: { min: 12, max: 20, criticalMin: 8, criticalMax: 30 },
  systolicBP: { min: 90, max: 140, criticalMin: 70, criticalMax: 180 },
  diastolicBP: { min: 60, max: 90, criticalMin: 40, criticalMax: 120 },
  temperature: { min: 36, max: 37.5, criticalMin: 35, criticalMax: 39.5 },
  spO2: { min: 95, max: 100, criticalMin: 90 },
  glucoseCapillary: { min: 70, max: 140, criticalMin: 50, criticalMax: 300 },
  painScale: { min: 0, max: 10 },
};

export type VitalStatus = "normal" | "warning" | "critical";

export function getVitalStatus(
  field: keyof typeof VITAL_RANGES,
  value: number,
): VitalStatus {
  const range = VITAL_RANGES[field];
  if (
    (range.criticalMin !== undefined && value < range.criticalMin) ||
    (range.criticalMax !== undefined && value > range.criticalMax)
  )
    return "critical";
  if (value < range.min || value > range.max) return "warning";
  return "normal";
}

// ─────────────────────────────────────────────
// Step 4 — AI Assessment + MTS Discriminators
// ─────────────────────────────────────────────

// Discriminators are dynamic based on the MTS category.
// Each question has an id, text, and the color it points to if positive.
export interface MTSDiscriminator {
  id: string;
  question: string;
  pointsToColor: TriageColor; // if the answer is "yes", suggests this minimum color
}

export interface Assessment {
  discriminators: Record<string, boolean | null>; // id → nurse's answer
  aiRecommendedColor: TriageColor | null;
  aiConfidence: number | null; // 0–1
  aiRationale: string | null; // natural language rationale
  finalColor: TriageColor | null; // nurse's final decision
  nurseOverride: boolean; // true if it differs from the AI suggestion
  nurseOverrideReason: string; // required if nurseOverride === true
}

// ─────────────────────────────────────────────
// Step 5 — Patient Destination
// ─────────────────────────────────────────────

export type PatientDestination = "waiting_room" | "census";

export interface Outcome {
  destination: PatientDestination | null;
  censusPatientId: string | null; // only if destination === 'census'
  notes: string;
  badgePrinted: boolean;
}

// ─────────────────────────────────────────────
// Global form shape
// ─────────────────────────────────────────────

export interface TriageFormData {
  patient: PatientInfo;
  complaint: ChiefComplaint;
  vitals: Vitals;
  assessment: Assessment;
  outcome: Outcome;
}

export const INITIAL_FORM_DATA: TriageFormData = {
  patient: {
    fullName: "",
    birthDate: "",
    biologicalSex: null,
    arrivalTime: "",
  },
  complaint: {
    rawText: "",
    mtsCategory: null,
    aiSuggestedCategory: null,
    aiSuggestionAccepted: false,
  },
  vitals: {
    heartRate: null,
    respiratoryRate: null,
    systolicBP: null,
    diastolicBP: null,
    temperature: null,
    spO2: null,
    glucoseCapillary: null,
    painScale: null,
    glasgowOcular: null,
    glasgowVerbal: null,
    glasgowMotor: null,
  },
  assessment: {
    discriminators: {},
    aiRecommendedColor: null,
    aiConfidence: null,
    aiRationale: null,
    finalColor: null,
    nurseOverride: false,
    nurseOverrideReason: "",
  },
  outcome: {
    destination: null,
    censusPatientId: null,
    notes: "",
    badgePrinted: false,
  },
};

// ─────────────────────────────────────────────
// API Types
// ─────────────────────────────────────────────

// Request a POST /triage/ai-suggest
export interface AITriageSuggestRequest {
  complaint: string;
  mtsCategory: MTSCategory;
  vitals: Vitals;
  discriminators: Record<string, boolean | null>;
  patientAge: number;
  patientSex: BiologicalSex;
}

// Response from POST /triage/ai-suggest
export interface AITriageSuggestResponse {
  recommendedColor: TriageColor;
  confidence: number;
  rationale: string;
  suggestedDiscriminators?: MTSDiscriminator[];
}

// Request a POST /triage (submit final)
export interface TriageSubmitRequest {
  patientName: string;
  patientBirthDate: string;
  patientSex: BiologicalSex;
  arrivalTime: string;
  complaint: string;
  mtsCategory: MTSCategory;
  vitals: Vitals;
  discriminators: Record<string, boolean | null>;
  finalColor: TriageColor;
  nurseOverride: boolean;
  nurseOverrideReason: string;
  aiRecommendedColor: TriageColor | null;
  destination: PatientDestination;
  censusPatientId: string | null;
  notes: string;
}

// Response from POST /triage
export interface TriageSubmitResponse {
  triageId: string;
  createdAt: string;
  finalColor: TriageColor;
  patientName: string;
}
