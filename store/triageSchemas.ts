// store/triageSchemas.ts
import { z } from "zod";
import { MTS_CATEGORY_LABELS } from "@/types/TriageTypes";

export const PatientSchema = z.object({
  fullName: z.string().min(2, "The name must contain at least 3 characters"),
  birthDate: z.string().min(1, "Date of birth is required"),
  biologicalSex: z.enum(["M", "F", "O"], {
    message: "Select biological gender",
  }),
  arrivalTime: z.string(),
});

export const ComplaintSchema = z.object({
  rawText: z
    .string()
    .min(10, "The consult must contain at least 10 characters"),
  mtsCategory: z.enum(
    Object.keys(MTS_CATEGORY_LABELS) as [string, ...string[]],
    { message: "Select a category" },
  ),
  aiSuggestedCategory: z.string().nullable(),
  aiSuggestionAccepted: z.boolean(),
});

export const VitalsSchema = z.object({
  heartRate: z.number({ message: "Required" }).positive(),
  respiratoryRate: z.number({ message: "Required" }).positive(),
  systolicBP: z.number({ message: "Required" }).positive(),
  diastolicBP: z.number().positive().nullable(),
  temperature: z.number({ message: "Required" }),
  spO2: z.number({ message: "Required" }).min(0).max(100),
  painScale: z.number({ message: "Required" }).min(0).max(10),
  glucoseCapillary: z.number().positive().nullable(),
  glasgowOcular: z.number().nullable(),
  glasgowVerbal: z.number().nullable(),
  glasgowMotor: z.number().nullable(),
});

export const AssessmentSchema = z
  .object({
    discriminators: z.record(z.string(), z.boolean().nullable()),
    aiRecommendedColor: z.string().nullable(),
    aiConfidence: z.number().nullable(),
    aiRationale: z.string().nullable(),
    finalColor: z.string({ message: "Assing a triage color" }),
    nurseOverride: z.boolean(),
    nurseOverrideReason: z.string(),
  })
  .refine((d) => !d.nurseOverride || d.nurseOverrideReason.trim().length > 0, {
    message: "Explain why you changed the AI recomendation ",
    path: ["nurseOverrideReason"],
  });

export const OutcomeSchema = z
  .object({
    destination: z.enum(["waiting_room", "census"], {
      message: "Select an option",
    }),
    censusPatientId: z.string().nullable(),
    notes: z.string(),
    badgePrinted: z.boolean(),
  })
  .refine((d) => d.destination !== "census" || d.censusPatientId !== null, {
    message: "Asign the patient to a room",
    path: ["censusPatientId"],
  });

// Los schemas en orden de paso — el índice es el número de paso
export const STEP_SCHEMAS = [
  PatientSchema,
  ComplaintSchema,
  VitalsSchema,
  AssessmentSchema,
  OutcomeSchema,
] as const;

export const TOTAL_STEPS = STEP_SCHEMAS.length;
