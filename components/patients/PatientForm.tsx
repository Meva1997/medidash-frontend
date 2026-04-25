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

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

type PatientFormInput = z.input<typeof patientSchema>;

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-gray-600";

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
      const { data: res } = await api.post("/patients", data);
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
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
      <Field label="Full name" error={errors.full_name?.message}>
        <input
          {...register("full_name")}
          placeholder="Maria García López"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" error={errors.age?.message}>
          <input
            {...register("age")}
            type="number"
            placeholder="45"
            className={inputClass}
          />
        </Field>

        <Field label="Gender" error={errors.gender?.message}>
          <select {...register("gender")} className={inputClass}>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)" error={errors.weight_kg?.message}>
          <input
            {...register("weight_kg")}
            type="number"
            step="0.1"
            placeholder="70"
            className={inputClass}
          />
        </Field>

        <Field label="Height (cm)" error={errors.height_cm?.message}>
          <input
            {...register("height_cm")}
            type="number"
            placeholder="170"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Glasgow Coma Score (3–15)"
        error={errors.glasgow_score?.message}
      >
        <input
          {...register("glasgow_score")}
          type="number"
          placeholder="15"
          className={inputClass}
        />
      </Field>

      {isError && (
        <p className="text-xs text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
          {isEdit
            ? "Failed to update patient. Please try again."
            : "Failed to create patient. Please try again."}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPending
            ? isEdit
              ? "Saving..."
              : "Admitting..."
            : isEdit
              ? "Save changes"
              : "Admit patient"}
        </button>
      </div>
    </form>
  );
}
