import { getRoutine } from "@/lib/routine";

export const dynamic = "force-static";

/** Static JSON feed, so the routine can be reused by other DIU tools. */
export async function GET() {
  const routine = await getRoutine();
  return Response.json(routine);
}
