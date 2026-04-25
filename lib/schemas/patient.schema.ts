import { z } from "zod";

const coerceNumber = (min: number, max: number, label: string) =>
  z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z
      .number({ error: `${label} must be a number` })
      .min(min, `${label} minimum is ${min}`)
      .max(max, `${label} maximum is ${max}`),
  );

export const patientSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  age: coerceNumber(0, 120, "Age").pipe(
    z.number().int("Age must be a whole number"),
  ),
  gender: z.enum(["male", "female", "other"], {
    error: "Please select a gender",
  }),
  weight_kg: coerceNumber(0.1, 500, "Weight"),
  height_cm: coerceNumber(1, 300, "Height"),
  glasgow_score: coerceNumber(3, 15, "Glasgow score").pipe(
    z.number().int("Glasgow score must be a whole number"),
  ),
});

export type PatientFormData = z.infer<typeof patientSchema>;
