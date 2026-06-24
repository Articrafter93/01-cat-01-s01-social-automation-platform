import { handleRouteError, fail, ok } from "@/lib/api/responses";
import { approvalActionSchema } from "@/lib/schemas";
import { rejectPublication } from "@/server/services/publications-service";
import { requireApiRole } from "@/server/auth/guard";
import { resolveReviewerIdentity } from "@/server/auth/reviewer";
import { z } from "zod";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiRole("approver");
    const reviewer = await resolveReviewerIdentity();
    if (!reviewer) {
      return fail("Authentication required", 401);
    }

    const body = approvalActionSchema.parse(await request.json());
    const { id } = z.object({ id: z.string().min(1) }).parse(await params);
    const publication = await rejectPublication(id, reviewer, body.note, body.channel);

    if (!publication) {
      return fail("Publication not found", 404);
    }

    return ok(publication);
  } catch (error) {
    return handleRouteError(error);
  }
}
