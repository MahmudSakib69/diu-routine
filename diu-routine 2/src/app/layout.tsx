import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { getRoutine } from "@/lib/routine";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DIU Class Routine",
    template: "%s · DIU Class Routine",
  },
  description:
    "Weekly class schedules for Daffodil International University faculty: search your initials to see time, room, course and section.",
};

const NAV = [
  { href: "/teachers", label: "Faculty" },
  { href: "/rooms", label: "Rooms" },
  { href: "/sections", label: "Sections" },
  { href: "/courses", label: "Courses" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const routine = await getRoutine();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="no-print sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                DIU
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">Class Routine</span>
                <span className="muted block text-[11px]">
                  {routine.meta.program
                    ? `${routine.meta.program} · ${routine.meta.term || "current term"}`
                    : "Daffodil International University"}
                </span>
              </span>
            </Link>

            <nav className="ml-auto hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-2"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 sm:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

        <footer className="no-print border-t border-line">
          <div className="muted mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-6 text-xs">
            <span>
              {routine.meta.department || "Daffodil International University"}
              {routine.meta.term ? ` · ${routine.meta.term}` : ""}
            </span>
            <span>Built from {routine.fileName}</span>
            <Link href="/check" className="ml-auto hover:text-brand-600">
              Check a routine file
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
