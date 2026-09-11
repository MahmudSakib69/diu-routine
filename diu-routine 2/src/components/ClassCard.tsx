import Link from "next/link";
import type { Entry } from "@/lib/types";
import { slug } from "@/lib/slug";
import { parentSection } from "@/lib/query";
import { durationLabel } from "@/lib/time";

export type HideField = "teacher" | "room" | "section";

const MAJOR_TONE: Record<string, string> = {
  ACT: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  FIN: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  HRM: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  MKT: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  MIS: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  SCM: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

export function ClassCard({
  entry,
  hide = [],
  compact = false,
}: {
  entry: Entry;
  hide?: HideField[];
  compact?: boolean;
}) {
  const showTeacher = !hide.includes("teacher");
  const showRoom = !hide.includes("room");
  const showSection = !hide.includes("section");

  return (
    <div
      className={`flex h-full flex-col gap-1.5 rounded-xl border border-line bg-surface-2 ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold tracking-tight text-brand-700 dark:text-brand-300">
          {entry.courseCode}
        </span>
        {entry.isLab ? (
          <span className="chip bg-brand-500/12 text-brand-700 dark:text-brand-300">Lab</span>
        ) : null}
      </div>

      <p className={`font-semibold leading-snug ${compact ? "text-[13px]" : "text-sm"}`}>
        {entry.courseTitle}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-0.5">
        {showSection ? (
          <Link
            href={`/sections/${slug(parentSection(entry.sectionRaw))}`}
            className={`chip ${
              MAJOR_TONE[entry.major] ?? "bg-black/5 dark:bg-white/10"
            } hover:opacity-80`}
          >
            {entry.sectionRaw}
          </Link>
        ) : null}
        {showRoom ? (
          <Link
            href={`/rooms/${slug(entry.room)}`}
            className="chip bg-black/5 hover:opacity-80 dark:bg-white/10"
          >
            {entry.room}
          </Link>
        ) : null}
        {showTeacher ? (
          <Link
            href={`/teachers/${entry.teacherKey}`}
            className="chip bg-brand-500/12 text-brand-700 hover:opacity-80 dark:text-brand-300"
          >
            {entry.teacher}
          </Link>
        ) : null}
      </div>

      {!compact ? (
        <p className="muted text-[11px]">
          {entry.timeLabel} · {durationLabel(entry.startMin, entry.endMin)}
        </p>
      ) : null}
    </div>
  );
}
