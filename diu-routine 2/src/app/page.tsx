import Link from "next/link";
import { getRoutine } from "@/lib/routine";
import { buildSearchItems } from "@/lib/search";
import { roomList, sectionList, teacherSummaries, dhakaNow } from "@/lib/query";
import { SearchBox } from "@/components/SearchBox";


export default async function HomePage() {
  const routine = await getRoutine();

  const teachers = teacherSummaries(routine);
  const items = buildSearchItems(routine);
  const { day } = dhakaNow();
  const todayCount = routine.entries.filter((e) => e.day === day).length;

  const groups = new Map<string, typeof teachers>();
  for (const t of teachers) {
    const letter = t.name[0].toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(t);
  }

  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-2xl pt-6 text-center sm:pt-12">
        <p className="muted text-xs font-semibold uppercase tracking-wider">
          {routine.meta.department || "Daffodil International University"}
          {routine.meta.program ? ` · ${routine.meta.program}` : ""}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Find your weekly routine
        </h1>
        <p className="muted mt-3 text-sm sm:text-base">
          Type your initials to see every class you teach this week, with time, room, course and
          section.
        </p>

        <div className="mt-6 text-left">
          <SearchBox items={items} autoFocus />
        </div>

        <p className="muted mt-3 text-xs">
          Also searches rooms, sections and course codes.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/teachers" className="card px-4 py-3 transition hover:border-brand-400">
          <p className="text-lg font-bold leading-tight">{teachers.length}</p>
          <p className="muted text-xs">Faculty members</p>
        </Link>
        <Link href="/sections" className="card px-4 py-3 transition hover:border-brand-400">
          <p className="text-lg font-bold leading-tight">{sectionList(routine).length}</p>
          <p className="muted text-xs">Sections</p>
        </Link>
        <Link href="/rooms" className="card px-4 py-3 transition hover:border-brand-400">
          <p className="text-lg font-bold leading-tight">{roomList(routine).length}</p>
          <p className="muted text-xs">Rooms</p>
        </Link>
        <div className="card px-4 py-3">
          <p className="text-lg font-bold leading-tight">{todayCount}</p>
          <p className="muted text-xs">Classes today ({day.slice(0, 3)})</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Browse faculty</h2>
            <p className="muted text-sm">Tap an initial to open that routine.</p>
          </div>
          <Link href="/teachers" className="btn btn-ghost">
            Full list
          </Link>
        </div>

        <div className="space-y-5">
          {[...groups.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, list]) => (
              <div key={letter} className="flex gap-4">
                <span className="muted w-5 shrink-0 pt-1.5 text-sm font-bold">{letter}</span>
                <div className="flex flex-wrap gap-2">
                  {list.map((t) => (
                    <Link
                      key={t.key}
                      href={`/teachers/${t.key}`}
                      className="card px-3 py-1.5 text-sm font-medium transition hover:border-brand-400 hover:text-brand-600"
                    >
                      {t.name}
                      <span className="muted ml-1.5 text-xs">{t.classCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
