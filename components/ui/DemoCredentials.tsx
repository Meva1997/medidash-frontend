"use client";

import { useState } from "react";

const DEMO_EMAIL = "user@example.com";
const DEMO_PASSWORD = "String97";

export function DemoCredentials() {
  const [copiedField, setCopiedField] = useState<"email" | "password" | null>(null);

  const copy = (field: "email" | "password", value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="mt-6 rounded-lg border border-teal-800/50 bg-teal-950/30 px-4 py-3">
      <p className="text-xs font-medium text-teal-400 mb-2.5 uppercase tracking-wide">
        Demo credentials
      </p>
      <div className="space-y-1.5">
        <CredentialRow
          label="Email"
          value={DEMO_EMAIL}
          copied={copiedField === "email"}
          onCopy={() => copy("email", DEMO_EMAIL)}
        />
        <CredentialRow
          label="Password"
          value={DEMO_PASSWORD}
          copied={copiedField === "password"}
          onCopy={() => copy("password", DEMO_PASSWORD)}
        />
      </div>
    </div>
  );
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-slate-500 w-14 shrink-0">{label}</span>
        <span className="text-xs font-mono text-slate-300 truncate">{value}</span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 text-xs px-2 py-0.5 rounded border border-slate-700 text-slate-400 hover:text-teal-400 hover:border-teal-700 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
