import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/routine";
import { parentSection, sectionEntries, sectionList } from "@/lib/query";
import { ScheduleView } from "@/components/ScheduleView";
import { PageActions } from "@/components/PageActions";
import { PageHeader } from "@/components/ui";

export async function generateStaticParams() {
  const routine = await getRoutine();
  return sectionList(routine).map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/sections/[section]">) {
  const { section } = await params;
  const routine = await getRoutine();
  const name = sectionEntries(routine, section)[0]?.sectionRaw;
  return { title: name ? `Section ${parentSection(name)}` : "Section" };
}

export default async function SectionPage({ params }: PageProps<"/sections/[section]">) {
  const { section } = await params;
  const routine = await getRoutine();

  const entries = sectionEntries(routine, section);
  if (!entries.length) notFound();

  return (
    <div>
      <div className="no-print mb-4">
        <Link href="/sections" className="muted text-sm hover:text-brand-600">
          ← All sections
        </Link>
      </div>
      <PageHeader
        eyebrow={`Batch ${entries[0].batch}`}
        title={`Section ${parentSection(entries[0].sectionRaw)}`}
        subtitle={`${entries.length} classes this week, lab groups included`}
        actions={<PageActions />}
      />
      <ScheduleView entries={entries} slots={routine.slots} />
    </div>
  );
}
