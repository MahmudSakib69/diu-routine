"use client";

import { useRef, useState } from "react";
import { findConflicts, roomList, sectionList, teacherSummaries } from "@/lib/query";
import type { Conflict, ParseWarning, RoutineMeta } from "@/lib/types";

type Report = {
  fileName: string;
  meta: RoutineMeta;
  slots: string[];
  counts: Record<string, number>;
  warnings: ParseWarning[];
  conflicts: Conflict[];
};

export function RoutineChecker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);

  const check = async (file: File) => {
    setBusy(true);
    setError("");
    setReport(null);
    try {
      // Loaded on demand: the spreadsheet reader is far larger than the site itself.
      const { parseWorkbook } = await import("@/lib/parse");
      const routine = await parseWorkbook(await file.arrayBuffer(), file.name);
      if (!routine.entries.length) {
        setError(
          "No classes were found. The sheet needs a Day column, a Room column and time-range columns, with cells written as “code, title, Sec: section, teacher”.",
        );
      } else {
        setReport({
          fileName: file.name,
          meta: routine.meta,
          slots: routine.slots.map((s) => s.label),
          counts: {
            Classes: routine.entries.length,
            Faculty: teacherSummaries(routine).length,
            Rooms: roomList(routine).length,
            Sections: sectionList(routine).length,
            Days: new Set(routine.entries.map((e) => e.day)).size,
          },
          warnings: routine.warnings,
          conflicts: findConflicts(routine),
        });
      }
    } catch (err) {
      setError(`Could not read the workbook: ${(err as Error).message}`);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void check(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`card cursor-pointer p-10 text-center transition ${
          dragging ? "border-brand-500 bg-brand-500/5" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void check(file);
            e.target.value = "";
          }}
        />
        <p className="text-sm font-semibold">
          {busy ? "Reading the workbook…" : "Drop the .xlsx here, or click to choose"}
        </p>
        <p className="muted mt-1 text-xs">
          Checked entirely in your browser. Nothing is uploaded anywhere.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-300 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {report ? (
        <div className="card p-6">
          <h2 className="text-lg font-semibold">{report.fileName}</h2>
          <p className="muted mt-1 text-sm">
            {report.meta.department || "Unknown department"}
            {report.meta.program ? ` · ${report.meta.program}` : ""}
            {report.meta.term ? ` · ${report.meta.term}` : ""}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries(report.counts).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-lg font-bold leading-tight">{value}</p>
                <p className="muted text-xs">{label}</p>
              </div>
            ))}
          </div>

          <p className="muted mt-4 text-xs">Time slots: {report.slots.join(" · ")}</p>

          {report.warnings.length ? (
            <details open className="mt-5 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-amber-800 dark:text-amber-300">
                {report.warnings.length} cell{report.warnings.length === 1 ? "" : "s"} will be
                skipped
              </summary>
              <ul className="mt-3 space-y-2 text-xs">
                {report.warnings.map((w, i) => (
                  <li key={i}>
                    <span className="font-mono font-semibold">{w.source}</span>{" "}
                    {w.text ? <span>“{w.text}” — </span> : null}
                    <span className="muted">{w.reason}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <p className="mt-5 text-sm text-brand-700 dark:text-brand-300">
              Every cell parsed cleanly.
            </p>
          )}

          {report.conflicts.length ? (
            <details open className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-red-700 dark:text-red-300">
                {report.conflicts.length} scheduling clash
                {report.conflicts.length === 1 ? "" : "es"}
              </summary>
              <ul className="mt-3 space-y-2 text-xs">
                {report.conflicts.slice(0, 50).map((c, i) => (
                  <li key={i}>
                    <span className="font-semibold">
                      {c.kind === "teacher" ? "Teacher" : "Section"} {c.subject}
                    </span>{" "}
                    · {c.day} {c.timeLabel} ·{" "}
                    <span className="muted">
                      {c.entries
                        .map((e) => `${e.courseCode} · ${e.sectionRaw} · Room ${e.room}`)
                        .join("  vs  ")}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <p className="mt-2 text-sm text-brand-700 dark:text-brand-300">
              No teacher or section is double-booked.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
