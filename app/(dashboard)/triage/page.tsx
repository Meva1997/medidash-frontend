"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
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
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// Steps — lazy placeholders until each is built
// Replace each with the real component as you build them
import StepPatientInfo from "@/components/triage/steps/StepPatientInfo";
import StepChiefComplaint from "@/components/triage/steps/StepChiefComplaint";
import StepVitals from "@/components/triage/steps/StepVitals";
import StepAIAssessment from "@/components/triage/steps/StepAIAssessment";
import StepOutcome from "@/components/triage/steps/StepOutcome";

const STEP_COMPONENTS = [
  StepPatientInfo,
  StepChiefComplaint,
  StepVitals,
  StepAIAssessment,
  StepOutcome,
];

export default function TriagePage() {
  const router = useRouter();
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
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // On mount: if there's an in-progress session (SPA re-navigation or first load),
  // show the saved-session modal. Otherwise reset arrivalTime for a fresh session.
  useEffect(() => {
    const { formData, updatePatient, revealSavedSession } =
      useTriageStore.getState();
    if (formData.patient.fullName.trim()) {
      revealSavedSession();
    } else {
      updatePatient({ arrivalTime: new Date().toISOString() });
    }
  }, []);

  // Intercept sidebar/link clicks when a triage session is in progress.
  useEffect(() => {
    if (!patient.fullName.trim()) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "/triage" || href.startsWith("#")) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [patient.fullName]);

  // Defer store-dependent rendering until after localStorage rehydration.
  // useSyncExternalStore is the React-canonical way to express "false on server,
  // true on client" without triggering the set-state-in-effect lint rule.
  const mounted = useSyncExternalStore(
    () => () => {}, // subscribe: no external store to watch
    () => true, // client snapshot: always mounted
    () => false, // server snapshot: never mounted
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

  const handleConfirmLeave = () => {
    if (pendingHref) {
      setPendingHref(null);
      router.push(pendingHref);
    }
  };
  const handleCancelLeave = () => setPendingHref(null);

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

  const ActiveStep = STEP_COMPONENTS[displayedStep];

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

      {/* Leave triage confirmation */}
      <ConfirmDialog
        open={pendingHref !== null}
        title="Leave triage?"
        description="Your progress is saved and you can continue when you return."
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />

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

            {/* Elapsed timer — only shows once patient data has been entered */}
            {patient.arrivalTime && patient.fullName.trim() && (
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
                    fill="currentColor"
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16m-.75-4.75a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-1.5 0zm.75-7a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{submit.error}</span>
                </div>
              )}

              {/* Active step */}
              <ActiveStep />
            </div>

            {/* Navigation — inside the card, separated by a border */}
            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <StepNavigation
                currentStep={currentStep}
                canAdvance={mounted && isCurrentStepValid()}
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
