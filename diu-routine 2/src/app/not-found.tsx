import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <h1 className="text-xl font-semibold">Not in this routine</h1>
      <p className="muted mt-2 text-sm">
        Those initials, room, section or course code aren’t in the published schedule. Check the
        spelling, or browse the full list.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          Search again
        </Link>
        <Link href="/teachers" className="btn btn-ghost">
          All faculty
        </Link>
      </div>
    </div>
  );
}
