"use client";

import { useState } from "react";
import { useDrugs, useCheckInteractions } from "@/hooks/useDrugs";
import { Drug } from "@/types";
import { Badge } from "@/components/ui/Badge";

export default function InteractionChecker() {
  const { data: drugs = [], isLoading: loadingDrugs } = useDrugs();
  const {
    mutate: checkInteractions,
    data: results,
    isPending,
    reset,
  } = useCheckInteractions();

  const [selected, setSelected] = useState<Drug[]>([]);
  const [search, setSearch] = useState("");

  const filtered = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((s) => s.id === drug.id),
  );

  function addDrug(drug: Drug) {
    setSelected((prev) => [...prev, drug]);
    setSearch("");
    reset();
  }

  function removeDrug(drugId: number) {
    setSelected((prev) => prev.filter((drug) => drug.id !== drugId));
    reset();
  }

  function handleCheck() {
    if (selected.length < 2) return;
    checkInteractions(selected.map((s) => s.name));
  }

  return (
    <div className="space-y-6">
      {/* Search & selection */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Select drugs to check
        </h2>

        {/* Selected pills */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((drug) => (
              <span
                key={drug.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-sm text-cyan-300"
              >
                {drug.name}
                <button
                  onClick={() => removeDrug(drug.id)}
                  className="text-cyan-400 hover:text-white transition-colors"
                  aria-label={`Remove ${drug.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={loadingDrugs ? "Loading catalog…" : "Search drugs…"}
            disabled={loadingDrugs}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
          />

          {/* Dropdown */}
          {search.length > 0 && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
              {filtered.map((drug) => (
                <li key={drug.id}>
                  <button
                    onClick={() => addDrug(drug)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                  >
                    {drug.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {search.length > 0 && filtered.length === 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-500">
              No drugs found
            </div>
          )}
        </div>

        {/* Check button */}
        <button
          onClick={handleCheck}
          disabled={selected.length < 2 || isPending}
          className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Checking…"
            : `Check interactions (${selected.length} drugs)`}
        </button>
      </div>

      {/* Results */}
      {results !== undefined && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Results
          </h2>

          {results.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3">
              <span className="text-green-400 text-lg">✓</span>
              <p className="text-sm text-green-300">
                No known interactions found between the selected drugs.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map((r, i) => {
                return (
                  <li
                    key={i}
                    className="rounded-lg border border-gray-700 bg-gray-800/60 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-medium text-gray-100">
                        {r.drug_a} <span className="text-gray-500">×</span>{" "}
                        {r.drug_b}
                      </p>
                      <Badge variant={r.severity}>{r.severity}</Badge>
                    </div>
                    {r.description && (
                      <p className="text-sm text-gray-400">{r.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
