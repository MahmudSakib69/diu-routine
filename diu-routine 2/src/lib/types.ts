export const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type Day = (typeof DAYS)[number];

export type Entry = {
  id: string;
  day: Day;
  /** Minutes from midnight; drives sorting and grid placement. */
  startMin: number;
  endMin: number;
  timeLabel: string;
  /** Display form of the teacher, exactly as the sheet wrote it. */
  teacher: string;
  /** Case/space-normalised key used for lookups and URLs. */
  teacherKey: string;
  room: string;
  courseCode: string;
  courseTitle: string;
  /** Whole section token from the sheet, e.g. "65A(SCM)" or "70C1". */
  sectionRaw: string;
  batch: string;
  section: string;
  /** Major in parentheses, e.g. SCM, HRM, ACT. */
  major: string;
  isLab: boolean;
  department: string;
  program: string;
  /** Sheet and cell the entry came from, so a bad cell can be traced back. */
  source: string;
};

export type RoutineMeta = {
  university: string;
  department: string;
  program: string;
  term: string;
};

export type ParseWarning = {
  source: string;
  text: string;
  reason: string;
};

export type Conflict = {
  kind: "teacher" | "section";
  subject: string;
  day: Day;
  timeLabel: string;
  entries: Entry[];
};

export type Routine = {
  uploadedAt: string;
  fileName: string;
  meta: RoutineMeta;
  slots: { startMin: number; endMin: number; label: string }[];
  entries: Entry[];
  warnings: ParseWarning[];
};

export type TeacherSummary = {
  key: string;
  name: string;
  classCount: number;
  weeklyMinutes: number;
  days: Day[];
  courses: string[];
  rooms: string[];
};

import { slug } from "./slug";

export function teacherKey(name: string): string {
  return slug(name);
}
