import InteractionChecker from "@/components/drugs/InteractionChecker";

export default function DrugsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">
          Drug Interaction Checker
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Select two or more drugs to check for known interactions.
        </p>
      </div>

      <InteractionChecker />
    </div>
  );
}
