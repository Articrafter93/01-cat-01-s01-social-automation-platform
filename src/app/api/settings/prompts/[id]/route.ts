import { fail, handleRouteError, ok } from "@/lib/api/responses";
import { requireApiRole } from "@/server/auth/guard";
import { updatePrompt } from "@/server/services/settings-service";
import { z } from "zod";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiRole("admin");
    const body = await request.json();
    const { id } = z.object({ id: z.string().min(1) }).parse(await params);
    const prompt = await updatePrompt(id, body);

    if (!prompt) {
      return fail("Prompt template not found", 404);
    }

    return ok(prompt);
  } catch (error) {
    return handleRouteError(error);
  }
}
