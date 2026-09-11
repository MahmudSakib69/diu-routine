import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/routine";
import { roomEntries, roomList } from "@/lib/query";
import { ScheduleView } from "@/components/ScheduleView";
import { PageActions } from "@/components/PageActions";
import { PageHeader } from "@/components/ui";

export async function generateStaticParams() {
  const routine = await getRoutine();
  return roomList(routine).map((r) => ({ room: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rooms/[room]">) {
  const { room } = await params;
  const routine = await getRoutine();
  const name = roomEntries(routine, room)[0]?.room;
  return { title: name ? `Room ${name}` : "Room" };
}

export default async function RoomPage({ params }: PageProps<"/rooms/[room]">) {
  const { room } = await params;
  const routine = await getRoutine();

  const entries = roomEntries(routine, room);
  if (!entries.length) notFound();

  return (
    <div>
      <div className="no-print mb-4">
        <Link href="/rooms" className="muted text-sm hover:text-brand-600">
          ← All rooms
        </Link>
      </div>
      <PageHeader
        eyebrow="Room"
        title={entries[0].room}
        subtitle={`${entries.length} classes scheduled this week`}
        actions={<PageActions />}
      />
      <ScheduleView entries={entries} slots={routine.slots} hide={["room"]} />
    </div>
  );
}
