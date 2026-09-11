import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/routine";
import { teacherSummaries } from "@/lib/query";
import { ScheduleView } from "@/components/ScheduleView";
import { PageActions } from "@/components/PageActions";
import { TodayPanel } from "@/components/TodayPanel";
import { PageHeader, Stat } from "@/components/ui";
import { DAYS } from "@/lib/types";
import { slug } from "@/lib/slug";

export async function generateStaticParams() {
  const routine = await getRoutine();
  return teacherSummaries(routine).map((t) => ({ key: t.key }));
}

export async function generateMetadata({ params }: PageProps<"/teachers/[key]">) {
  const { key } = await params;
  const routine = await getRoutine();
  const name = routine.entries.find((e) => e.teacherKey === key)?.teacher;
  return { title: name ? `${name}'s routine` : "Routine" };
}

export default async function TeacherPage({ params }: PageProps<"/teachers/[key]">) {
  const { key } = await params;
  const routine = await getRoutine();

  const entries = routine.entries.filter((e) => e.teacherKey === key);
  if (!entries.length) notFound();

  const summary = teacherSummaries(routine).find((t) => t.key === key)!;
  const busiest = DAYS.map((d) => ({
    day: d,
    count: entries.filter((e) => e.day === d).length,
  })).sort((a, b) => b.count - a.count)[0];

  return (
    <div>
      <div className="no-print mb-4">
        <Link href="/teachers" className="muted text-sm hover:text-brand-600">
          ← All faculty
        </Link>
      </div>

      <PageHeader
        eyebrow={`${routine.meta.department || "DIU"}${
          routine.meta.term ? ` · ${routine.meta.term}` : ""
        }`}
        title={summary.name}
        subtitle="Weekly class routine"
        actions={<PageActions />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Classes per week" value={summary.classCount} />
        <Stat label="Teaching hours" value={(summary.weeklyMinutes / 60).toFixed(1)} />
        <Stat label="Teaching days" value={summary.days.length} />
        <Stat label="Busiest day" value={busiest.count ? busiest.day.slice(0, 3) : "—"} />
      </div>

      <TodayPanel entries={entries} />

      <ScheduleView entries={entries} slots={routine.slots} hide={["teacher"]} />

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Courses</h2>
        <div className="flex flex-wrap gap-2">
          {summary.courses.map((c) => {
            const [code, ...rest] = c.split(" ");
            return (
              <Link
                key={c}
                href={`/courses/${slug(code)}`}
                className="card px-3 py-1.5 text-sm transition hover:border-brand-400"
              >
                <span className="font-mono text-xs text-brand-700 dark:text-brand-300">
                  {code}
                </span>{" "}
                {rest.join(" ")}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
