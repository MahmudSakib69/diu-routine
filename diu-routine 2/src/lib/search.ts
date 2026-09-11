import type { SearchItem } from "@/components/SearchBox";
import { courseList, roomList, sectionList, teacherSummaries } from "./query";
import type { Routine } from "./types";

export function buildSearchItems(routine: Routine): SearchItem[] {
  const teachers = teacherSummaries(routine).map<SearchItem>((t) => ({
    type: "Faculty",
    label: t.name,
    sublabel: `${t.classCount} class${t.classCount === 1 ? "" : "es"} · ${t.days
      .map((d) => d.slice(0, 3))
      .join(", ")}`,
    href: `/teachers/${t.key}`,
  }));

  const rooms = roomList(routine).map<SearchItem>((r) => ({
    type: "Room",
    label: r.room,
    sublabel: `${r.classCount} classes this week`,
    href: `/rooms/${r.slug}`,
  }));

  const sections = sectionList(routine).map<SearchItem>((s) => ({
    type: "Section",
    label: s.sectionRaw,
    sublabel: `Batch ${s.batch} · ${s.classCount} classes`,
    href: `/sections/${s.slug}`,
  }));

  const courses = courseList(routine).map<SearchItem>((c) => ({
    type: "Course",
    label: `${c.code} ${c.title}`,
    sublabel: `${c.classCount} classes · ${c.teachers.slice(0, 3).join(", ")}`,
    href: `/courses/${c.slug}`,
  }));

  return [...teachers, ...sections, ...rooms, ...courses];
}
