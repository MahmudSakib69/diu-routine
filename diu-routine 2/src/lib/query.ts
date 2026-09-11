import { DAYS, type Conflict, type Day, type Entry, type Routine, type TeacherSummary } from "./types";
import { slug } from "./slug";

export function byDay(entries: Entry[]): { day: Day; entries: Entry[] }[] {
  return DAYS.map((day) => ({
    day,
    entries: entries
      .filter((e) => e.day === day)
      .sort((a, b) => a.startMin - b.startMin || a.room.localeCompare(b.room)),
  })).filter((d) => d.entries.length);
}

export function teacherSummaries(routine: Routine): TeacherSummary[] {
  const map = new Map<string, TeacherSummary>();
  for (const e of routine.entries) {
    let t = map.get(e.teacherKey);
    if (!t) {
      t = {
        key: e.teacherKey,
        name: e.teacher,
        classCount: 0,
        weeklyMinutes: 0,
        days: [],
        courses: [],
        rooms: [],
      };
      map.set(e.teacherKey, t);
    }
    t.classCount += 1;
    t.weeklyMinutes += e.endMin - e.startMin;
    if (!t.days.includes(e.day)) t.days.push(e.day);
    const course = `${e.courseCode} ${e.courseTitle}`;
    if (!t.courses.includes(course)) t.courses.push(course);
    if (!t.rooms.includes(e.room)) t.rooms.push(e.room);
  }
  for (const t of map.values()) {
    t.days.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
    t.courses.sort();
    t.rooms.sort(compareRooms);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function compareRooms(a: string, b: string) {
  const na = Number(a.match(/\d+/)?.[0] ?? NaN);
  const nb = Number(b.match(/\d+/)?.[0] ?? NaN);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b);
}

export function roomList(routine: Routine) {
  const map = new Map<string, number>();
  for (const e of routine.entries) map.set(e.room, (map.get(e.room) ?? 0) + 1);
  return [...map.entries()]
    .map(([room, classCount]) => ({ room, slug: slug(room), classCount }))
    .sort((a, b) => compareRooms(a.room, b.room));
}

export function roomEntries(routine: Routine, roomSlug: string) {
  return routine.entries.filter((e) => slug(e.room) === roomSlug);
}

export function courseEntries(routine: Routine, courseSlug: string) {
  return routine.entries.filter((e) => slug(e.courseCode) === courseSlug);
}

export function sectionList(routine: Routine) {
  const map = new Map<string, { batch: string; sectionRaw: string; slug: string; classCount: number }>();
  for (const e of routine.entries) {
    // Lab groups (70C1/70C2) belong to their parent section.
    const parent = parentSection(e.sectionRaw);
    const cur =
      map.get(parent) ??
      { batch: e.batch, sectionRaw: parent, slug: slug(parent), classCount: 0 };
    cur.classCount += 1;
    map.set(parent, cur);
  }
  return [...map.values()].sort(
    (a, b) => Number(a.batch) - Number(b.batch) || a.sectionRaw.localeCompare(b.sectionRaw),
  );
}

export function parentSection(sectionRaw: string) {
  return sectionRaw.replace(/^(\d+)([A-Za-z]+)\d+$/, "$1$2");
}

export function sectionEntries(routine: Routine, sectionSlug: string) {
  return routine.entries.filter((e) => slug(parentSection(e.sectionRaw)) === sectionSlug);
}

export function courseList(routine: Routine) {
  const map = new Map<
    string,
    { code: string; slug: string; title: string; classCount: number; teachers: string[] }
  >();
  for (const e of routine.entries) {
    const cur = map.get(e.courseCode) ?? {
      code: e.courseCode,
      slug: slug(e.courseCode),
      title: e.courseTitle,
      classCount: 0,
      teachers: [],
    };
    cur.classCount += 1;
    if (!cur.teachers.includes(e.teacher)) cur.teachers.push(e.teacher);
    map.set(e.courseCode, cur);
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}

function overlaps(a: Entry, b: Entry) {
  return a.day === b.day && a.startMin < b.endMin && b.startMin < a.endMin;
}

/** Same teacher (or same section) booked into two rooms at once. */
export function findConflicts(routine: Routine): Conflict[] {
  const conflicts: Conflict[] = [];
  const check = (kind: "teacher" | "section", keyOf: (e: Entry) => string) => {
    const groups = new Map<string, Entry[]>();
    for (const e of routine.entries) {
      const k = keyOf(e);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(e);
    }
    for (const [subject, list] of groups) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (!overlaps(list[i], list[j])) continue;
          if (list[i].room === list[j].room) continue;
          conflicts.push({
            kind,
            subject,
            day: list[i].day,
            timeLabel: list[i].timeLabel,
            entries: [list[i], list[j]],
          });
        }
      }
    }
  };
  check("teacher", (e) => e.teacher);
  check("section", (e) => e.sectionRaw);
  return conflicts.sort(
    (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.subject.localeCompare(b.subject),
  );
}

export function dhakaNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday") as Day;
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}
