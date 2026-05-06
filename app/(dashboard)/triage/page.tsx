"use client";
import { useState, useEffect } from "react";
import {
  useTriageStore,
  selectCurrentStep,
  selectPatient,
  selectSubmit,
} from "@/store/triageStore";
import SavedSessionModal from "@/components/triage/SavedSessionModal";
import SubmitSuccessTriage from "@/components/triage/SubmitSuccesTriage";
import { ElapsedTimer } from "@/components/triage/ElapsedTimer";
import { TriageStepper } from "@/components/triage/TriageStepper";
import { StepNavigation } from "@/components/triage/StepNavigation";

// Steps — lazy placeholders until each is built
// Replace each with the real component as you build them
// import { StepPatientInfo } from "@/components/triage/steps/StepPatientInfo";
// import { StepChiefComplaint } from "@/components/triage/steps/StepChiefComplaint";
// import { StepVitals } from "@/components/triage/steps/StepVitals";
// import { StepAIAssessment } from "@/components/triage/steps/StepAIAssessment";
// import { StepOutcome } from "@/components/triage/steps/StepOutcome";

// const STEP_COMPONENTS = [
//   StepPatientInfo,
//   StepChiefComplaint,
//   StepVitals,
//   StepAIAssessment,
//   StepOutcome,
// ];

export default function TriagePage() {
  const currentStep = useTriageStore(selectCurrentStep);
  const patient = useTriageStore(selectPatient);
  const submit = useTriageStore(selectSubmit);
  const hasSavedSession = useTriageStore((s) => s.hasSavedSession);
  const isCurrentStepValid = useTriageStore((s) => s.isCurrentStepValid);
  const goNext = useTriageStore((s) => s.goNext);
  const goPrev = useTriageStore((s) => s.goPrev);
  const submitTriage = useTriageStore((s) => s.submitTriage);
  const resetTriage = useTriageStore((s) => s.resetTriage);
  const acknowledgeSavedSession = useTriageStore(
    (s) => s.acknowledgeSavedSession,
  );

  // Animate step transitions
  const [displayedStep, setDisplayedStep] = useState(currentStep);

  useEffect(() => {
    if (currentStep === displayedStep) return;
    const id = setTimeout(() => {
      setDisplayedStep(currentStep);
    }, 180);

    return () => clearTimeout(id);
  }, [currentStep, displayedStep]);

  const isTransitioning = currentStep !== displayedStep;

  // ── Handlers ──
  const handleNext = () => goNext();
  const handlePrev = () => goPrev();
  const handleSubmit = () => submitTriage();

  const handleContinueSession = () => acknowledgeSavedSession();
  const handleDiscardSession = () => resetTriage();

  // ── Render success ──
  if (submit.status === "success" && submit.result) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <SubmitSuccessTriage
            triageId={submit.result.triageId}
            patientName={submit.result.patientName}
            onReset={resetTriage}
          />
        </div>
      </main>
    );
  }

  // const ActiveStep = STEP_COMPONENTS[displayedStep];

  return (
    <>
      {/* Saved session modal */}
      {hasSavedSession && (
        <SavedSessionModal
          patientName={patient.fullName}
          onContinue={handleContinueSession}
          onDiscard={handleDiscardSession}
        />
      )}

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* ── Header ── */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Triage Assessment
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manchester Triage System
              </p>
            </div>

            {/* Elapsed timer — only shows after arrivalTime is set */}
            {patient.arrivalTime && (
              <ElapsedTimer
                arrivalTime={patient.arrivalTime}
                className="shrink-0"
              />
            )}
          </div>

          {/* ── Stepper ── */}
          <div className="mb-8">
            <TriageStepper />
          </div>

          {/* ── Step card ── */}
          <div
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200
                       dark:border-slate-700/60 shadow-sm overflow-hidden"
          >
            {/* Step content with fade transition */}
            <div
              className="p-6 md:p-8 transition-opacity duration-180"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              {/* Submit error banner */}
              {submit.status === "error" && submit.error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800
                             bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.75a.75.75 0 00-1.5 0v4.5zm.75-7a1 1 0 100-2 1 1 0 000 2z"
                    />
                  </svg>
                  <span>{submit.error}</span>
                </div>
              )}

              {/* Active step */}
              {/* <ActiveStep /> */}
            </div>

            {/* Navigation — inside the card, separated by a border */}
            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <StepNavigation
                currentStep={currentStep}
                canAdvance={isCurrentStepValid()}
                isSubmitting={submit.status === "loading"}
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
