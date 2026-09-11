import { RoutineChecker } from "@/components/RoutineChecker";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Check a routine file" };

const REPO = process.env.NEXT_PUBLIC_REPO_URL;

export default function CheckPage() {
  return (
    <div>
      <PageHeader
        title="Check a routine file"
        subtitle="Drop next term's spreadsheet here before you commit it, to see exactly what the site will show."
      />

      <RoutineChecker />

      <section className="card mt-8 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Publishing a new routine</h2>
        <ol className="muted mt-3 space-y-2 text-sm">
          <li>
            1. Check the file above. Fix anything listed as skipped or clashing, then re-check.
          </li>
          <li>
            2. Open the{" "}
            {REPO ? (
              <a
                className="text-brand-600 underline"
                href={`${REPO}/tree/main/routine`}
                target="_blank"
                rel="noreferrer"
              >
                <code>routine/</code> folder
              </a>
            ) : (
              <code>routine/</code>
            )}{" "}
            in the repository and delete the spreadsheet already there.
          </li>
          <li>
            3. Use <strong>Add file → Upload files</strong> to add the new one, and commit to{" "}
            <code>main</code>.
          </li>
          <li>
            4. The site rebuilds itself and is live in about two minutes. Anyone with write access
            to the repository can do this; there is no separate password.
          </li>
        </ol>
      </section>
    </div>
  );
}
