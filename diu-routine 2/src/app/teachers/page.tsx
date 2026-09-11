import Link from "next/link";
import { getRoutine } from "@/lib/routine";
import { teacherSummaries } from "@/lib/query";
import { buildSearchItems } from "@/lib/search";
import { SearchBox } from "@/components/SearchBox";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Faculty" };

export default async function TeachersPage() {
  const routine = await getRoutine();
  const teachers = teacherSummaries(routine);

  return (
    <div>
      <PageHeader
        eyebrow={routine.meta.department}
        title="Faculty"
        subtitle={`${teachers.length} teachers in the ${routine.meta.term || "current"} routine`}
      />

      <div className="no-print mb-6 max-w-xl">
        <SearchBox items={buildSearchItems(routine)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="muted border-b border-line text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Initials</th>
              <th className="px-4 py-3 font-semibold">Classes</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Hours / week</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Days</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">Courses</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.key} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/teachers/${t.key}`} className="hover:text-brand-600">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{t.classCount}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {(t.weeklyMinutes / 60).toFixed(1)}
                </td>
                <td className="muted hidden px-4 py-3 text-xs md:table-cell">
                  {t.days.map((d) => d.slice(0, 3)).join(" · ")}
                </td>
                <td className="muted hidden max-w-md truncate px-4 py-3 text-xs lg:table-cell">
                  {t.courses.map((c) => c.split(" ")[0]).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
