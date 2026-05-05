"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "@/lib/api";
import { patientSchema, PatientFormData } from "@/lib/schemas/patient.schema";
import { useUpdatePatient } from "@/hooks/usePatients";
import { Patient } from "@/types";

interface PatientFormProps {
  onSuccess: () => void;
  patient?: Patient;
}

type PatientFormInput = z.input<typeof patientSchema>;

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="pf-field">
      <label className="pf-label">{label}</label>
      {children}
      {hint && !error && <p className="pf-hint">{hint}</p>}
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}

function UnitInput({
  unit,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { unit: string }) {
  return (
    <div className="pf-unit-wrap">
      <input className="pf-input pf-unit-input" {...props} />
      <span className="pf-unit">{unit}</span>
    </div>
  );
}

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export default function PatientForm({ onSuccess, patient }: PatientFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!patient;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormInput, unknown, PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: isEdit
      ? {
          full_name: patient.full_name,
          age: String(patient.age) as unknown as number,
          gender: patient.gender,
          weight_kg: String(patient.weight_kg) as unknown as number,
          height_cm: String(patient.height_cm) as unknown as number,
          glasgow_score: String(patient.glasgow_score) as unknown as number,
        }
      : { glasgow_score: 15 },
  });

  const {
    mutate: createPatient,
    isPending: isCreating,
    isError: isCreateError,
  } = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const { data: res } = await api.post("/patients/", data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onSuccess();
    },
  });

  const {
    mutate: updatePatient,
    isPending: isUpdating,
    isError: isUpdateError,
  } = useUpdatePatient();

  const isPending = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;

  const onSubmit = (data: PatientFormData) => {
    if (isEdit) {
      updatePatient({ id: patient.id, data }, { onSuccess });
    } else {
      createPatient(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pf-form">
      <Field label="Full name" error={errors.full_name?.message}>
        <input
          {...register("full_name")}
          placeholder="Maria García López"
          className="pf-input"
          autoComplete="off"
        />
      </Field>

      <div className="pf-row">
        <Field label="Age" error={errors.age?.message}>
          <UnitInput {...register("age")} type="number" placeholder="45" unit="yr" />
        </Field>

        <Field label="Gender" error={errors.gender?.message}>
          <div className="pf-gender">
            {GENDERS.map(({ value, label }) => (
              <label key={value} className="pf-gender-option">
                <input
                  type="radio"
                  value={value}
                  {...register("gender")}
                  className="sr-only"
                />
                <span className="pf-gender-label">{label}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>

      <div className="pf-row">
        <Field label="Weight" error={errors.weight_kg?.message}>
          <UnitInput
            {...register("weight_kg")}
            type="number"
            step="0.1"
            placeholder="70"
            unit="kg"
          />
        </Field>

        <Field label="Height" error={errors.height_cm?.message}>
          <UnitInput
            {...register("height_cm")}
            type="number"
            placeholder="170"
            unit="cm"
          />
        </Field>
      </div>

      <Field
        label="Glasgow Coma Score"
        error={errors.glasgow_score?.message}
        hint="Range: 3 (severe) — 15 (normal)"
      >
        <input
          {...register("glasgow_score")}
          type="number"
          placeholder="15"
          min={3}
          max={15}
          className="pf-input"
        />
      </Field>

      {isError && (
        <div className="pf-api-error">
          {isEdit
            ? "Failed to update patient. Please try again."
            : "Failed to admit patient. Please try again."}
        </div>
      )}

      <button type="submit" disabled={isPending} className="pf-submit">
        <span className="pf-submit-inner">
          {isPending && <span className="pf-spinner" />}
          {isPending
            ? isEdit ? "Saving..." : "Admitting..."
            : isEdit ? "Save changes" : "Admit patient"}
        </span>
      </button>
    </form>
  );
}
