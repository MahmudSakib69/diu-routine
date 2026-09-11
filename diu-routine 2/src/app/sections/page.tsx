import Link from "next/link";
import { getRoutine } from "@/lib/routine";
import { sectionList } from "@/lib/query";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Sections" };

export default async function SectionsPage() {
  const routine = await getRoutine();

  const sections = sectionList(routine);
  const batches = new Map<string, typeof sections>();
  for (const s of sections) {
    if (!batches.has(s.batch)) batches.set(s.batch, []);
    batches.get(s.batch)!.push(s);
  }

  return (
    <div>
      <PageHeader
        title="Sections"
        subtitle={`${sections.length} sections across ${batches.size} batches`}
      />
      <div className="space-y-6">
        {[...batches.entries()].map(([batch, list]) => (
          <div key={batch}>
            <h2 className="mb-2 text-sm font-semibold">Batch {batch}</h2>
            <div className="flex flex-wrap gap-2">
              {list.map((s) => (
                <Link
                  key={s.sectionRaw}
                  href={`/sections/${s.slug}`}
                  className="card px-3 py-1.5 text-sm font-medium transition hover:border-brand-400 hover:text-brand-600"
                >
                  {s.sectionRaw}
                  <span className="muted ml-1.5 text-xs">{s.classCount}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
