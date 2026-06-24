import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/lib/api/errors";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Validation error", 422, error.flatten());
  }

  if (error instanceof DomainError) {
    return fail(error.message, error.status);
  }

  // Unexpected errors must not leak internal details (DB driver messages,
  // stack hints) to the client. Log server-side for observability and return
  // a generic message.
  console.error("[api] unexpected error", error);
  return fail("Internal server error", 500);
}
