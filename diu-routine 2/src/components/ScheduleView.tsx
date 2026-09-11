"use client";

import { useEffect, useState } from "react";
import { DAYS, type Day, type Entry, type Routine } from "@/lib/types";
import { ClassCard, type HideField } from "./ClassCard";
import { dhakaNow } from "@/lib/query";

type Slot = Routine["slots"][number];

/** Places a day's entries into the slot columns, returning colspans. */
function layoutRow(entries: Entry[], slots: Slot[]) {
  const cells: ({ entry: Entry; span: number } | null | "covered")[] = slots.map(() => null);
  const sorted = [...entries].sort((a, b) => a.startMin - b.startMin);

  for (const entry of sorted) {
    const start = slots.findIndex((s) => s.startMin === entry.startMin);
    if (start === -1 || cells[start] !== null) continue;
    let span = 1;
    while (
      start + span < slots.length &&
      slots[start + span].startMin < entry.endMin &&
      cells[start + span] === null
    ) {
      span += 1;
    }
    cells[start] = { entry, span };
    for (let i = start + 1; i < start + span; i++) cells[i] = "covered";
  }

  // Anything that did not line up with a column still has to be shown.
  const unplaced = sorted.filter(
    (e) => !cells.some((c) => c && c !== "covered" && c.entry.id === e.id),
  );
  return { cells, unplaced };
}

export function ScheduleView({
  entries,
  slots,
  hide = [],
  highlightToday = true,
}: {
  entries: Entry[];
  slots: Slot[];
  hide?: HideField[];
  highlightToday?: boolean;
}) {
  // Resolved in the browser: the page itself is built once and cached by the CDN,
  // so "today" cannot be baked in at build time.
  const [today, setToday] = useState<Day | null>(null);
  useEffect(() => {
    if (highlightToday) setToday(dhakaNow().day);
  }, [highlightToday]);

  const days = DAYS.filter((d) => entries.some((e) => e.day === d));

  if (!entries.length) {
    return (
      <div className="card muted p-8 text-center text-sm">No classes in this routine.</div>
    );
  }

  return (
    <>
      {/* Week grid: readable on a laptop and on paper. */}
      <div className="card hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="muted sticky left-0 z-10 w-24 bg-surface px-3 py-3 text-xs font-semibold uppercase tracking-wide">
                Day
              </th>
              {slots.map((slot) => (
                <th
                  key={slot.label}
                  className="muted min-w-[180px] border-l border-line px-3 py-3 text-[11px] font-semibold uppercase tracking-wide"
                >
                  {slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const { cells, unplaced } = layoutRow(
                entries.filter((e) => e.day === day),
                slots,
              );
              const isToday = day === today;
              return (
                <tr key={day} className="border-t border-line align-top">
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 px-3 py-3 text-sm font-semibold ${
                      isToday ? "bg-brand-500/10 text-brand-700 dark:text-brand-300" : "bg-surface"
                    }`}
                  >
                    {day.slice(0, 3)}
                    {isToday ? <span className="muted block text-[10px]">today</span> : null}
                  </th>
                  {cells.map((cell, i) =>
                    cell === "covered" ? null : (
                      <td
                        key={slots[i].label}
                        colSpan={cell ? cell.span : 1}
                        className="border-l border-line p-1.5"
                      >
                        {cell ? <ClassCard entry={cell.entry} hide={hide} compact /> : null}
                      </td>
                    ),
                  )}
                  {unplaced.length ? (
                    <td className="border-l border-line p-1.5">
                      {unplaced.map((e) => (
                        <ClassCard key={e.id} entry={e} hide={hide} compact />
                      ))}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Day-by-day list: the phone view, and what most faculty will actually use. */}
      <div className="space-y-5 lg:hidden">
        {days.map((day) => (
          <DaySection
            key={day}
            day={day}
            entries={entries.filter((e) => e.day === day)}
            hide={hide}
            isToday={day === today}
          />
        ))}
      </div>
    </>
  );
}

function DaySection({
  day,
  entries,
  hide,
  isToday,
}: {
  day: Day;
  entries: Entry[];
  hide: HideField[];
  isToday: boolean;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold">{day}</h3>
        {isToday ? (
          <span className="chip bg-brand-500/12 text-brand-700 dark:text-brand-300">Today</span>
        ) : null}
        <span className="muted text-xs">
          {entries.length} class{entries.length === 1 ? "" : "es"}
        </span>
      </div>
      <div className="space-y-2">
        {[...entries]
          .sort((a, b) => a.startMin - b.startMin)
          .map((entry) => (
            <div key={entry.id} className="card flex gap-3 p-3">
              <div className="w-20 shrink-0">
                <p className="text-xs font-semibold leading-tight">
                  {entry.timeLabel.split(" - ")[0]}
                </p>
                <p className="muted text-[11px] leading-tight">
                  – {entry.timeLabel.split(" - ")[1]}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <ClassCard entry={entry} hide={hide} compact />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
