# DIU Class Routine

A website that turns the departmental class-schedule spreadsheet into a
per-teacher weekly routine. Faculty search their initials and get their week
with time, room, course and section.

The site is completely static and hosted free on GitHub Pages. The spreadsheet
in [`routine/`](routine) is the source of truth: commit a new one and a workflow
rebuilds and redeploys the site from it.

Built for the Department of Business Administration schedule format, but the
parser reads the sheet's own header row, so other departments work as long as
the layout matches (see [Spreadsheet format](#spreadsheet-format)).

## Publishing a new routine

No password, no server, no terminal. Write access to this repository is what
grants the ability to publish.

1. Open **[/check](https://mahmudsakib69.github.io/diu-routine/check/)** on the
   live site and drop next term's `.xlsx` in. It is read in your browser and
   nothing is uploaded. You get the class counts, any cell the parser cannot
   read, and any teacher or section that ends up double-booked. Fix the sheet
   and re-check until it's clean.
2. Open the [`routine/`](routine) folder here and delete the spreadsheet
   already in it.
3. **Add file → Upload files**, drop the new `.xlsx` in, and commit to `main`.
4. The deploy workflow rebuilds the site; it is live in about two minutes.

Keep exactly one spreadsheet in `routine/` — the build fails on purpose if there
are none or more than one, so it is never ambiguous which routine is published.
Old ones live in the git history, and every change shows who made it and when.

Opening a pull request instead of committing straight to `main` runs the same
build as a check, so you can see it parse before it goes live.

## What faculty see

- Search by initials, room, section or course code.
- A weekly grid on a laptop, a day-by-day list on a phone, today highlighted.
- Print / Save as PDF on every schedule page.
- Separate pages per room, per section and per course.
- `/routine.json` — the whole parsed routine as JSON, if another DIU tool wants it.

## Spreadsheet format

The parser looks for a header row containing a `Day` column, a `Room` column,
and one column per time slot, each labelled with a time range:

```
Day       | Room     | 8:30 AM - 10:00 AM | 10:00 AM - 11:30 AM | ...
Saturday  | 1101(A)  | 0411-115, Principles of Accounting, Sec: 73A, DSFA | ...
```

Rules it relies on:

- Each class cell reads `course code, course title, Sec: section, teacher`.
  Course titles may contain commas ("AI, Data, and Society" parses correctly).
- A day name in the Day column starts a block and applies to every row beneath
  it until the next day name, whether or not the cells are merged.
- Sections carry the batch, an optional lab group and an optional major:
  `73A`, `70C1`, `65A(SCM)`.
- The same class written into two adjacent slots is merged into one longer
  block, so a three-hour lab shows as 8:30 AM - 11:30 AM rather than twice.
- Rows above the header supply the department, program and term shown across
  the site.

Anything that does not match is skipped and listed on the check page rather than
silently dropped.

## Running it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

`npm run build` writes the static site to `out/`, exactly as the workflow does.
`BASE_PATH` prefixes every URL for a project site (the workflow sets it from the
Pages configuration); leave it empty for local dev or a custom domain.

## Layout

```
routine/            the spreadsheet the site is built from
src/lib/parse.ts    Excel -> class entries
src/lib/query.ts    derived views: teachers, rooms, sections, clashes
src/lib/routine.ts  loads and parses routine/ at build time
src/app/            pages: search, faculty, rooms, sections, courses, check
.github/workflows/  build and deploy to Pages on every push to main
```
