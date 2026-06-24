import { z } from "zod";
import { ok, handleRouteError } from "@/lib/api/responses";
import { requireApiRole } from "@/server/auth/guard";
import { createPublication, listPublications } from "@/server/services/publications-service";

export async function GET(request: Request) {
  try {
    await requireApiRole("editor");
    z.object({
      status: z.string().optional(),
    }).parse(Object.fromEntries(new URL(request.url).searchParams));
    return ok(await listPublications());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiRole("editor");
    const body = await request.json();
    const publication = await createPublication(body);
    return ok(publication, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
