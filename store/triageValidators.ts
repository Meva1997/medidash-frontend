// store/triageValidators.ts
import type { TriageFormData } from "@/types/TriageTypes";
import { STEP_SCHEMAS, TOTAL_STEPS } from "./triageSchemas";

export { TOTAL_STEPS };

export function isStepValid(step: number, data: TriageFormData): boolean {
  const sectionKeys: (keyof TriageFormData)[] = [
    "patient",
    "complaint",
    "vitals",
    "assessment",
    "outcome",
  ];
  const schema = STEP_SCHEMAS[step];
  const section = data[sectionKeys[step]];
  return schema.safeParse(section).success;
}

export function areAllPreviousStepsValid(
  upToStep: number,
  data: TriageFormData,
): boolean {
  for (let i = 0; i < upToStep; i++) {
    if (!isStepValid(i, data)) return false;
  }
  return true;
}
