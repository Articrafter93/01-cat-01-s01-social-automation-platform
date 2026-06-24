import { z } from "zod";
import { handleRouteError, ok } from "@/lib/api/responses";
import { requireApiRole } from "@/server/auth/guard";
import { listExecutions } from "@/server/services/execution-service";

export async function GET(request: Request) {
  try {
    await requireApiRole("approver");
    z.object({
      limit: z.coerce.number().int().positive().max(100).optional(),
    }).parse(Object.fromEntries(new URL(request.url).searchParams));
    return ok(await listExecutions());
  } catch (error) {
    return handleRouteError(error);
  }
}
