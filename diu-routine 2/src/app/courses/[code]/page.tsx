import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/routine";
import { courseEntries, courseList } from "@/lib/query";
import { ScheduleView } from "@/components/ScheduleView";
import { PageActions } from "@/components/PageActions";
import { PageHeader } from "@/components/ui";

export async function generateStaticParams() {
  const routine = await getRoutine();
  return courseList(routine).map((c) => ({ code: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[code]">) {
  const { code } = await params;
  const routine = await getRoutine();
  const entry = courseEntries(routine, code)[0];
  return { title: entry ? `${entry.courseCode} ${entry.courseTitle}` : "Course" };
}

export default async function CoursePage({ params }: PageProps<"/courses/[code]">) {
  const { code } = await params;
  const routine = await getRoutine();

  const entries = courseEntries(routine, code);
  if (!entries.length) notFound();

  return (
    <div>
      <div className="no-print mb-4">
        <Link href="/courses" className="muted text-sm hover:text-brand-600">
          ← All courses
        </Link>
      </div>
      <PageHeader
        eyebrow={entries[0].courseCode}
        title={entries[0].courseTitle}
        subtitle={`${entries.length} classes this week`}
        actions={<PageActions />}
      />
      <ScheduleView entries={entries} slots={routine.slots} />
    </div>
  );
}
