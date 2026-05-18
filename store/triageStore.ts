import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";
import { isAxiosError } from "axios";

import {
  type TriageFormData,
  type TriageSubmitRequest,
  type TriageSubmitResponse,
  INITIAL_FORM_DATA,
} from "@/types/TriageTypes";

import {
  isStepValid,
  areAllPreviousStepsValid,
  TOTAL_STEPS,
} from "./triageValidators";

// ─────────────────────────────────────────────
// Submit State
// ─────────────────────────────────────────────

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface SubmitState {
  status: SubmitStatus;
  result: TriageSubmitResponse | null;
  error: string | null;
}

// ─────────────────────────────────────────────
// Store form
// ─────────────────────────────────────────────

interface TriageStore {
  //? Navigation
  currentStep: number;
  hasSavedSession: boolean; //True if local storage has data

  //? Form data
  formData: TriageFormData;

  //? Submit state
  submit: SubmitState;

  //? Nav actions
  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: number) => void;

  //? Data actions
  updatePatient: (patch: Partial<TriageFormData["patient"]>) => void;
  updateComplaint: (patch: Partial<TriageFormData["complaint"]>) => void;
  updateVitals: (patch: Partial<TriageFormData["vitals"]>) => void;
  updateAssesment: (patch: Partial<TriageFormData["assessment"]>) => void;
  updateOutcome: (patch: Partial<TriageFormData["outcome"]>) => void;

  //? Validate
  isCurrentStepValid: () => boolean;
  isStepValid: (step: number) => boolean;

  //? Backend submit
  submitTriage: () => Promise<void>;

  //? Utilities
  resetTriage: () => void;
  acknowledgeSavedSession: () => void;
  revealSavedSession: () => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildSubmitPayload(data: TriageFormData): TriageSubmitRequest {
  return {
    patientName: data.patient.fullName,
    patientBirthDate: data.patient.birthDate,
    patientSex: data.patient.biologicalSex!,
    arrivalTime: data.patient.arrivalTime,
    complaint: data.complaint.rawText,
    mtsCategory: data.complaint.mtsCategory!,
    vitals: data.vitals,
    discriminators: data.assessment.discriminators,
    finalColor: data.assessment.finalColor!,
    nurseOverride: data.assessment.nurseOverride,
    nurseOverrideReason: data.assessment.nurseOverrideReason,
    aiRecommendedColor: data.assessment.aiRecommendedColor,
    destination: data.outcome.destination!,
    censusPatientId: data.outcome.censusPatientId,
    notes: data.outcome.notes,
  };
}

function hasMeaningfulData(data: TriageFormData): boolean {
  return data.patient.fullName.trim().length > 0;
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useTriageStore = create<TriageStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      hasSavedSession: false,
      formData: {
        ...INITIAL_FORM_DATA,
        patient: {
          ...INITIAL_FORM_DATA.patient,
          arrivalTime: new Date().toISOString(),
        },
      },
      submit: {
        status: "idle",
        result: null,
        error: null,
      },

      //? Nav
      goNext: () => {
        const { currentStep, formData } = get();
        if (!isStepValid(currentStep, formData)) return;
        if (currentStep >= TOTAL_STEPS - 1) return;
        set({ currentStep: currentStep + 1 });
      },

      goPrev: () => {
        const { currentStep } = get();
        if (currentStep <= 0) return;
        set({ currentStep: currentStep - 1 });
      },

      goToStep: (step) => {
        const { formData } = get();
        if (step < 0 || step >= TOTAL_STEPS) return;

        if (!areAllPreviousStepsValid(step, formData)) return;
        set({ currentStep: step });
      },

      //? Data update

      updatePatient: (patch) =>
        set((state) => ({
          formData: {
            ...state.formData,
            patient: { ...state.formData.patient, ...patch },
          },
        })),

      updateComplaint: (patch) =>
        set((state) => ({
          formData: {
            ...state.formData,
            complaint: { ...state.formData.complaint, ...patch },
          },
        })),

      updateVitals: (patch) =>
        set((state) => ({
          formData: {
            ...state.formData,
            vitals: { ...state.formData.vitals, ...patch },
          },
        })),

      updateAssesment: (patch) => {
        set((state) => {
          const current = state.formData.assessment;
          const next = { ...current, ...patch };

          //? If nurse changes AI suggestion, activate nurseOverride auto

          if (
            patch.finalColor !== undefined &&
            next.aiRecommendedColor !== null &&
            patch.finalColor !== next.aiRecommendedColor
          ) {
            next.nurseOverride = true;
          }

          //? If the nurse selects again de color suggestion by AI, clear override
          if (
            patch.finalColor !== undefined &&
            patch.finalColor === next.aiRecommendedColor
          ) {
            next.nurseOverride = false;
            next.nurseOverrideReason = "";
          }

          return {
            formData: { ...state.formData, assessment: next },
          };
        });
      },

      updateOutcome: (patch) =>
        set((state) => ({
          formData: {
            ...state.formData,
            outcome: { ...state.formData.outcome, ...patch },
          },
        })),

      isCurrentStepValid: () => {
        const { currentStep, formData } = get();
        return isStepValid(currentStep, formData);
      },

      isStepValid: (step) => {
        return isStepValid(step, get().formData);
      },

      submitTriage: async () => {
        const { formData } = get();

        set({ submit: { status: "loading", result: null, error: null } });

        try {
          const payload = buildSubmitPayload(formData);

          const { data: result } = await api.post<TriageSubmitResponse>(
            "/triage",
            payload,
          );

          set({
            submit: { status: "success", result, error: null },
            formData: {
              ...formData,
              outcome: { ...formData.outcome, badgePrinted: false },
            },
          });
        } catch (err) {
          const message = isAxiosError(err)
            ? (err.response?.data?.detail ?? `Error ${err.response?.status}`)
            : "Unknown error";

          set({
            submit: { status: "error", result: null, error: message },
          });
        }
      },

      //? Utilities

      resetTriage: () =>
        set({
          currentStep: 0,
          hasSavedSession: false,
          formData: {
            ...INITIAL_FORM_DATA,
            patient: {
              ...INITIAL_FORM_DATA.patient,
              arrivalTime: new Date().toISOString(),
            },
          },
          submit: { status: "idle", result: null, error: null },
        }),

      acknowledgeSavedSession: () => set({ hasSavedSession: false }),

      revealSavedSession: () => {
        const { formData, submit } = get();
        if (hasMeaningfulData(formData) && submit.status !== "success") {
          set({ hasSavedSession: true });
        }
      },
    }),

    {
      name: "medidash-triage-session",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
      }),

      onRehydrateStorage: () => (state) => {
        if (state && hasMeaningfulData(state.formData)) {
          state.hasSavedSession = true;
        }
      },
    },
  ),
);

export const selectPatient = (s: TriageStore) => s.formData.patient;
export const selectComplaint = (s: TriageStore) => s.formData.complaint;
export const selectVitals = (s: TriageStore) => s.formData.vitals;
export const selectAssessment = (s: TriageStore) => s.formData.assessment;
export const selectOutcome = (s: TriageStore) => s.formData.outcome;
export const selectCurrentStep = (s: TriageStore) => s.currentStep;
export const selectSubmit = (s: TriageStore) => s.submit;
