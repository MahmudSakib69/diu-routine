"use client";

import { useEffect, useState } from "react";
import { dhakaNow } from "@/lib/query";
import type { Entry } from "@/lib/types";

/**
 * Computed in the browser rather than at build time, because the deployed
 * pages are static and would otherwise be stuck on whichever day they were built.
 */
export function TodayPanel({ entries }: { entries: Entry[] }) {
  const [now, setNow] = useState<{ day: string; minutes: number } | null>(null);
  useEffect(() => setNow(dhakaNow()), []);

  if (!now) {
    return <div className="no-print card mb-6 h-[58px] animate-pulse p-4" aria-hidden />;
  }

  const todays = entries
    .filter((e) => e.day === now.day)
    .sort((a, b) => a.startMin - b.startMin);
  const next = todays.find((e) => e.endMin > now.minutes);

  return (
    <div className="no-print card mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 p-4 text-sm">
      <span className="chip bg-brand-500/12 text-brand-700 dark:text-brand-300">{now.day}</span>
      {next ? (
        <span>
          Next: <strong>{next.courseCode}</strong> {next.courseTitle} · {next.timeLabel} · Room{" "}
          {next.room} · Sec {next.sectionRaw}
        </span>
      ) : todays.length ? (
        <span className="muted">All {todays.length} classes for today are done.</span>
      ) : (
        <span className="muted">No classes scheduled today.</span>
      )}
    </div>
  );
}
