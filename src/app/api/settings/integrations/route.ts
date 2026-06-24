import { z } from "zod";
import { handleRouteError, ok } from "@/lib/api/responses";
import { requireApiRole } from "@/server/auth/guard";
import { listIntegrations } from "@/server/services/settings-service";

export async function GET(request: Request) {
  try {
    await requireApiRole("admin");
    z.object({
      environment: z.string().optional(),
    }).parse(Object.fromEntries(new URL(request.url).searchParams));
    return ok(await listIntegrations());
  } catch (error) {
    return handleRouteError(error);
  }
}
