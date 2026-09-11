"use client";

import { useState } from "react";

export function PageActions({ shareLabel = "Copy link" }: { shareLabel?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : shareLabel}
      </button>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        Print / PDF
      </button>
    </>
  );
}
