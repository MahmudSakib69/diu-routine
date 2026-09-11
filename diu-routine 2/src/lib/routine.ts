import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseWorkbook } from "./parse";
import type { Routine } from "./types";

const ROUTINE_DIR = process.env.ROUTINE_DIR ?? path.join(process.cwd(), "routine");

let cached: Promise<Routine> | null = null;

async function findWorkbook() {
  let files: string[];
  try {
    files = (await readdir(ROUTINE_DIR)).filter(
      (f) => /\.xlsx?$/i.test(f) && !f.startsWith("~$"),
    );
  } catch {
    throw new Error(
      `No routine/ folder found. Put the class schedule .xlsx in ${ROUTINE_DIR}.`,
    );
  }

  if (files.length === 0) {
    throw new Error(
      `No .xlsx file in ${ROUTINE_DIR}. Commit the class schedule there and the site will rebuild from it.`,
    );
  }
  if (files.length > 1) {
    throw new Error(
      `Found ${files.length} spreadsheets in ${ROUTINE_DIR} (${files.join(
        ", ",
      )}). Keep exactly one so it is unambiguous which routine is published; git history keeps the old ones.`,
    );
  }
  return files[0];
}

/**
 * Reads and parses the committed spreadsheet. Runs at build time only: the
 * deployed site is static, so publishing a new routine means committing a new
 * file and letting the workflow rebuild.
 */
export function getRoutine(): Promise<Routine> {
  if (!cached) {
    cached = (async () => {
      const fileName = await findWorkbook();
      const buffer = await readFile(path.join(ROUTINE_DIR, fileName));
      const routine = await parseWorkbook(buffer, fileName);
      if (!routine.entries.length) {
        throw new Error(
          `${fileName} produced no classes. Check that it has a Day column, a Room column and time-range columns.`,
        );
      }
      return routine;
    })();
  }
  return cached;
}
