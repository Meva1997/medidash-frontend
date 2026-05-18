"use client";

import { useEffect, useState } from "react";

const EXCUSES = [
  "Developers are in the waiting room... waiting for inspiration.",
  "This page was triaged. Color: grey. Priority: someday.",
  "The feature requested a second opinion. Still waiting on results.",
  "Our team is reviewing the MTS discriminators for this page.",
  "A consultation with the software architect has been initiated. There's a waitlist.",
  "Diagnosis: missing functionality. Treatment: pending assignment.",
];

export default function WaitingRoomPage() {
  const [excuse, setExcuse] = useState(EXCUSES[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setExcuse(EXCUSES[Math.floor(Math.random() * EXCUSES.length)]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Triage badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-gray-800/60 px-3 py-1 text-xs font-semibold text-emerald-400 tracking-widest uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Waiting Room — Under Construction
          </span>
        </div>

        {/* Main icon */}
        <div className="relative mx-auto w-28 h-28">
          {/* Outer ring spin */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-700 animate-spin [animation-duration:8s]" />
          {/* Inner circle */}
          <div className="absolute inset-3 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center">
            <span className="text-4xl select-none">🚧</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-100 tracking-tight">
            This room isn&apos;t ready yet
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Ironically, the{" "}
            <span className="text-gray-400 font-medium">Waiting Room</span> also
            has to wait. <br className="hidden sm:block" />
            We appreciate your patience — at least there are no forms to fill
            out.
          </p>
        </div>

        {/* Rotating excuse card */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 min-h-14 flex items-center justify-center transition-all">
          <p className="text-sm text-gray-400 italic">&ldquo;{excuse}&rdquo;</p>
        </div>

        {/* Fake vitals row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Time waiting", value: "—", color: "text-gray-600" },
            { label: "Features in triage", value: "1", color: "text-red-400" },
            { label: "Estimated ETA", value: "∞", color: "text-gray-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-3 flex flex-col items-center gap-1"
            >
              <span
                className={`text-lg font-mono font-semibold tabular-nums ${color}`}
              >
                {value}
              </span>
              <span className="text-[10px] text-gray-600 text-center leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
