import ExcelJS from "exceljs";
import {
  DAYS,
  type Day,
  type Entry,
  type ParseWarning,
  type Routine,
  type RoutineMeta,
  teacherKey,
} from "./types";
import { formatSlot, parseSlot } from "./time";

const DAY_LOOKUP = new Map<string, Day>(
  DAYS.flatMap((d) => [
    [d.toLowerCase(), d] as [string, Day],
    [d.slice(0, 3).toLowerCase(), d] as [string, Day],
  ]),
);

/** `0411-115, Principles of Accounting, Sec: 73A, DSFA` */
const CELL_RE =
  /^\s*([0-9]{3,5}\s*-\s*[0-9]{2,4})\s*,\s*(.+?)\s*,\s*Sec\.?\s*:?\s*([^,]+?)\s*,\s*(.+?)\s*$/i;

/** `65A(SCM)`, `70C1`, `73A`, `65SA`, `66A` */
const SECTION_RE = /^([0-9]+)\s*([A-Za-z]*?)\s*([0-9]*)\s*(?:\(\s*([^)]+?)\s*\))?$/;

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value as unknown;
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.richText)) {
      return (o.richText as { text: string }[]).map((t) => t.text).join("").trim();
    }
    if (typeof o.text === "string") return o.text.trim();
    if (o.result !== undefined) return String(o.result).trim();
    if (typeof o.hyperlink === "string") return String(o.hyperlink).trim();
  }
  return String(v).trim();
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function splitSection(raw: string) {
  const m = SECTION_RE.exec(clean(raw));
  if (!m) return { batch: "", section: clean(raw), major: "" };
  const [, batch, letters, group, major] = m;
  return {
    batch,
    section: `${letters}${group}`.toUpperCase(),
    major: (major ?? "").toUpperCase(),
  };
}

function readHeaderMeta(ws: ExcelJS.Worksheet, headerRow: number): RoutineMeta {
  const meta: RoutineMeta = { university: "", department: "", program: "", term: "" };
  for (let r = 1; r < headerRow; r++) {
    const text = clean(cellText(ws.getCell(r, 1)));
    if (!text) continue;
    const lower = text.toLowerCase();
    if (lower.includes("university") && !meta.university) meta.university = text;
    else if (lower.startsWith("department") && !meta.department) {
      meta.department = text.replace(/^department\s*(of)?\s*:?\s*/i, "Department of ");
    } else if (lower.startsWith("program") && !meta.program) {
      meta.program = text.replace(/^program\s*:?\s*/i, "");
    } else if (/schedule|routine|semester|spring|summer|fall/i.test(text) && !meta.term) {
      meta.term = text.replace(/^class\s*schedule\s*,?\s*/i, "");
    }
  }
  return meta;
}

/** Locates the `Day | Room | <time slots...>` row and reads the slot columns. */
function findHeader(ws: ExcelJS.Worksheet) {
  const maxRow = Math.min(ws.rowCount, 40);
  for (let r = 1; r <= maxRow; r++) {
    let dayCol = 0;
    let roomCol = 0;
    for (let c = 1; c <= ws.columnCount; c++) {
      const text = clean(cellText(ws.getCell(r, c))).toLowerCase();
      if (!dayCol && /^days?$/.test(text)) dayCol = c;
      if (!roomCol && /^(room|room *no\.?|classroom)$/.test(text)) roomCol = c;
    }
    if (!dayCol || !roomCol) continue;

    const slots: { col: number; startMin: number; endMin: number; label: string }[] = [];
    for (let c = roomCol + 1; c <= ws.columnCount; c++) {
      const label = clean(cellText(ws.getCell(r, c)));
      const slot = label ? parseSlot(label) : null;
      if (slot) slots.push({ col: c, label, ...slot });
    }
    if (slots.length) return { row: r, dayCol, roomCol, slots };
  }
  return null;
}

function parseSheet(ws: ExcelJS.Worksheet, fallbackMeta: RoutineMeta) {
  const entries: Entry[] = [];
  const warnings: ParseWarning[] = [];
  const header = findHeader(ws);
  if (!header) {
    return {
      entries,
      warnings: [
        {
          source: ws.name,
          text: "",
          reason:
            "No header row found. The sheet needs a row with a Day column, a Room column, and time-range columns such as \u201c8:30 AM - 10:00 AM\u201d.",
        },
      ],
      slots: [],
      meta: fallbackMeta,
    };
  }

  const meta = { ...fallbackMeta, ...stripEmpty(readHeaderMeta(ws, header.row)) };

  let currentDay: Day | null = null;
  for (let r = header.row + 1; r <= ws.rowCount; r++) {
    const dayText = clean(cellText(ws.getCell(r, header.dayCol)));
    const room = clean(cellText(ws.getCell(r, header.roomCol)));
    if (dayText) {
      const day = DAY_LOOKUP.get(dayText.toLowerCase());
      // A day block header resets the block; unknown text is noise, not a day.
      if (day) currentDay = day;
    }
    if (!room || !currentDay) continue;

    for (const slot of header.slots) {
      const cell = ws.getCell(r, slot.col);
      const raw = clean(cellText(cell));
      if (!raw) continue;
      const source = `${ws.name}!${cell.address}`;
      const m = CELL_RE.exec(raw);
      if (!m) {
        warnings.push({
          source,
          text: raw,
          reason:
            "Cell does not match \u201ccourse code, course title, Sec: section, teacher\u201d, so it was skipped.",
        });
        continue;
      }
      const [, code, title, sectionRaw, teacherRaw] = m;
      const teacher = clean(teacherRaw);
      const { batch, section, major } = splitSection(sectionRaw);
      entries.push({
        id: `${ws.name}-${r}-${slot.col}`,
        day: currentDay,
        startMin: slot.startMin,
        endMin: slot.endMin,
        timeLabel: formatSlot(slot.startMin, slot.endMin),
        teacher,
        teacherKey: teacherKey(teacher),
        room,
        courseCode: clean(code).replace(/\s*-\s*/, "-"),
        courseTitle: clean(title),
        sectionRaw: clean(sectionRaw),
        batch,
        section,
        major,
        isLab: /\blab\b/i.test(title) || /\blab\b/i.test(room),
        department: meta.department,
        program: meta.program,
        source,
      });
    }
  }

  return { entries, warnings, slots: header.slots, meta };
}

function stripEmpty(meta: RoutineMeta): Partial<RoutineMeta> {
  return Object.fromEntries(Object.entries(meta).filter(([, v]) => v));
}

/**
 * Back-to-back cells with the same class are one block in the sheet's eyes
 * (a 3-hour lab is written twice), so fold them into a single entry.
 */
function mergeAdjacent(entries: Entry[]): Entry[] {
  const key = (e: Entry) =>
    [e.day, e.room, e.courseCode, e.sectionRaw, e.teacherKey].join("|");
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = key(e);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(e);
  }

  const out: Entry[] = [];
  for (const group of groups.values()) {
    group.sort((a, b) => a.startMin - b.startMin);
    let run = group[0];
    for (const next of group.slice(1)) {
      if (next.startMin <= run.endMin) {
        run = { ...run, endMin: Math.max(run.endMin, next.endMin) };
      } else {
        out.push({ ...run, timeLabel: formatSlot(run.startMin, run.endMin) });
        run = next;
      }
    }
    out.push({ ...run, timeLabel: formatSlot(run.startMin, run.endMin) });
  }

  return out.sort(
    (a, b) =>
      DAYS.indexOf(a.day) - DAYS.indexOf(b.day) ||
      a.startMin - b.startMin ||
      a.room.localeCompare(b.room),
  );
}

export async function parseWorkbook(
  buffer: ArrayBuffer | Buffer,
  fileName: string,
): Promise<Routine> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as ArrayBuffer);

  let meta: RoutineMeta = {
    university: "Daffodil International University",
    department: "",
    program: "",
    term: "",
  };
  const entries: Entry[] = [];
  const warnings: ParseWarning[] = [];
  const slotMap = new Map<string, { startMin: number; endMin: number; label: string }>();

  for (const ws of wb.worksheets) {
    if (ws.state === "hidden" || ws.state === "veryHidden") continue;
    const sheet = parseSheet(ws, meta);
    meta = { ...meta, ...stripEmpty(sheet.meta) };
    entries.push(...sheet.entries);
    warnings.push(...sheet.warnings);
    for (const s of sheet.slots) {
      slotMap.set(`${s.startMin}-${s.endMin}`, {
        startMin: s.startMin,
        endMin: s.endMin,
        label: formatSlot(s.startMin, s.endMin),
      });
    }
  }

  if (!entries.length && !warnings.length) {
    warnings.push({
      source: fileName,
      text: "",
      reason: "No class rows were found in any sheet.",
    });
  }

  return {
    uploadedAt: new Date().toISOString(),
    fileName,
    meta,
    slots: [...slotMap.values()].sort((a, b) => a.startMin - b.startMin),
    entries: mergeAdjacent(entries),
    warnings,
  };
}
