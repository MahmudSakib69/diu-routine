import Link from "next/link";
import { getRoutine } from "@/lib/routine";
import { roomList } from "@/lib/query";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Rooms" };

export default async function RoomsPage() {
  const routine = await getRoutine();
  const rooms = roomList(routine);

  return (
    <div>
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} rooms used in the ${routine.meta.term || "current"} routine`}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rooms.map((r) => (
          <Link
            key={r.room}
            href={`/rooms/${r.slug}`}
            className="card p-4 transition hover:border-brand-400"
          >
            <p className="font-semibold">{r.room}</p>
            <p className="muted text-xs">{r.classCount} classes / week</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
