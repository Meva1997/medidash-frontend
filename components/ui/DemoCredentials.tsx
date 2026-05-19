"use client";

import { useState } from "react";

const ACCOUNTS = [
  { role: "Doctor", email: "user@example.com", password: "String97" },
  { role: "Nurse", email: "nurse@email.com", password: "String97" },
] as const;

type CopiedKey = `${number}-email` | `${number}-password`;

export function DemoCredentials() {
  const [copiedKey, setCopiedKey] = useState<CopiedKey | null>(null);

  const copy = (key: CopiedKey, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="mt-6 rounded-lg border border-teal-800/50 bg-teal-950/30 px-4 py-3">
      <p className="text-xs font-medium text-teal-400 mb-2.5 uppercase tracking-wide">
        Demo credentials
      </p>
      <div className="space-y-3">
        {ACCOUNTS.map((account, i) => (
          <div key={account.role}>
            <p className="text-xs font-medium text-slate-500 mb-1">{account.role}</p>
            <div className="space-y-1.5">
              <CredentialRow
                label="Email"
                value={account.email}
                copied={copiedKey === `${i}-email`}
                onCopy={() => copy(`${i}-email` as CopiedKey, account.email)}
              />
              <CredentialRow
                label="Password"
                value={account.password}
                copied={copiedKey === `${i}-password`}
                onCopy={() => copy(`${i}-password` as CopiedKey, account.password)}
              />
            </div>
          </div>
        ))}
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
