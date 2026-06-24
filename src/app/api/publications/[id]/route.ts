import { z } from "zod";
import { fail, handleRouteError, ok } from "@/lib/api/responses";
import { requireApiRole } from "@/server/auth/guard";
import { getPublicationById } from "@/server/services/publications-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiRole("editor");
    const { id } = z.object({ id: z.string().min(1) }).parse(await params);
    const publication = await getPublicationById(id);

    if (!publication) {
      return fail("Publication not found", 404);
    }

    return ok(publication);
  } catch (error) {
    return handleRouteError(error);
  }
}
