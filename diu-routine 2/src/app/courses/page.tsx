import Link from "next/link";
import { getRoutine } from "@/lib/routine";
import { courseList } from "@/lib/query";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const routine = await getRoutine();
  const courses = courseList(routine);

  return (
    <div>
      <PageHeader title="Courses" subtitle={`${courses.length} courses offered this term`} />
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="muted border-b border-line text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Classes</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Teachers</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.code} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <Link href={`/courses/${c.slug}`}>{c.code}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/courses/${c.slug}`} className="hover:text-brand-600">
                    {c.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.classCount}</td>
                <td className="muted hidden max-w-sm truncate px-4 py-3 text-xs md:table-cell">
                  {c.teachers.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
