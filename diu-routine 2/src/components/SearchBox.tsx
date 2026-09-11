"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type SearchItem = {
  type: "Faculty" | "Room" | "Section" | "Course";
  label: string;
  sublabel: string;
  href: string;
};

const TYPE_TONE: Record<SearchItem["type"], string> = {
  Faculty: "bg-brand-500/12 text-brand-700 dark:text-brand-300",
  Room: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  Section: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  Course: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
};

function score(item: SearchItem, q: string) {
  const label = item.label.toLowerCase();
  const sub = item.sublabel.toLowerCase();
  if (label === q) return 0;
  if (label.startsWith(q)) return 1;
  if (label.split(/[\s.()-]+/).some((w) => w.startsWith(q))) return 2;
  if (label.includes(q)) return 3;
  if (sub.includes(q)) return 4;
  return Infinity;
}

export function SearchBox({
  items,
  placeholder = "Search your initials, e.g. DKRT",
  autoFocus = false,
}: {
  items: SearchItem[];
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .map((item) => ({ item, s: score(item, q) }))
      .filter((r) => r.s !== Infinity)
      .sort((a, b) => a.s - b.s || a.item.label.localeCompare(b.item.label))
      .slice(0, 8)
      .map((r) => r.item);
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <svg
          className="muted pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          className="field pl-10"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              go(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-label="Search the routine"
        />
      </div>

      {open && query.trim() ? (
        <div className="card absolute z-30 mt-2 w-full overflow-hidden p-1 shadow-lg">
          {results.length ? (
            results.map((item, i) => (
              <button
                key={item.href}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                  i === active ? "bg-surface-2" : ""
                }`}
              >
                <span className={`chip ${TYPE_TONE[item.type]} w-16 justify-center`}>
                  {item.type}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
                  <span className="muted block truncate text-xs">{item.sublabel}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="muted px-3 py-6 text-center text-sm">
              Nothing matches “{query.trim()}”.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
