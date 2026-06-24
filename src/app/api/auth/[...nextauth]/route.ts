import type { NextRequest } from "next/server";
import { z } from "zod";
import { handlers } from "@/auth";

const authRouteSchema = z.object({
  nextauth: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ nextauth?: string[] }> }) {
  authRouteSchema.parse(await context.params);
  return handlers.GET(request);
}

export async function POST(request: NextRequest, context: { params: Promise<{ nextauth?: string[] }> }) {
  authRouteSchema.parse(await context.params);
  return handlers.POST(request);
}
