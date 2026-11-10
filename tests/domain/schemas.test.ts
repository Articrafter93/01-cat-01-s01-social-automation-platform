import { describe, expect, it } from "vitest";
import { publicationCreateSchema, workflowResultSchema } from "@/lib/schemas";
import { handleRouteError } from "@/lib/api/responses";

// Pins the runtime behavior that the zod 3 -> 4 upgrade touched: the string-to-string
// error.context map, z.url() (which in zod 4 also trims the value it returns) together
// with the protocol refinement, and the 422 validation payload shape. The two-argument
// z.record form itself is enforced by tsc, not by these tests: zod 4 still accepts the
// one-argument form at runtime.

const validPublication = {
  sourceUrl: "https://news.example.com/article",
  sourceType: "article",
  brand: "Acme",
  locale: "en",
  tone: "friendly",
  useAiImage: false,
  requestedChannels: ["linkedin"],
};

describe("workflowResultSchema error.context", () => {
  const base = { status: "fatal_error", payload: null, metrics: { durationMs: 12 } };

  it("accepts a string-to-string context map", () => {
    const parsed = workflowResultSchema.parse({
      ...base,
      error: { code: "E_TIMEOUT", message: "timed out", retriable: true, context: { step: "scrape" } },
    });
    expect(parsed.error?.context).toEqual({ step: "scrape" });
  });

  it("rejects non-string context values", () => {
    const result = workflowResultSchema.safeParse({
      ...base,
      error: { code: "E_TIMEOUT", message: "timed out", retriable: true, context: { step: 3 } },
    });
    expect(result.success).toBe(false);
  });
});

describe("publicationCreateSchema sourceUrl", () => {
  it("accepts an https url", () => {
    expect(publicationCreateSchema.safeParse(validPublication).success).toBe(true);
  });

  it("rejects a value that is not a url", () => {
    expect(publicationCreateSchema.safeParse({ ...validPublication, sourceUrl: "not a url" }).success).toBe(false);
  });

  it("returns the url trimmed, which is what gets stored and checked by the url policy", () => {
    const parsed = publicationCreateSchema.parse({ ...validPublication, sourceUrl: "  https://news.example.com/article\n" });
    expect(parsed.sourceUrl).toBe("https://news.example.com/article");
  });

  it("rejects a non-http(s) protocol through the refinement", () => {
    const result = publicationCreateSchema.safeParse({ ...validPublication, sourceUrl: "ftp://example.com/file" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain("URL protocol must be HTTP or HTTPS");
  });
});

describe("handleRouteError with a validation error", () => {
  it("returns 422 with the flattened { formErrors, fieldErrors } details", async () => {
    const result = publicationCreateSchema.safeParse({ ...validPublication, brand: "" });
    expect(result.success).toBe(false);

    const response = handleRouteError(result.error);
    expect(response.status).toBe(422);

    const body = (await response.json()) as {
      error: string;
      details: { formErrors: string[]; fieldErrors: Record<string, string[]> };
    };
    expect(body.error).toBe("Validation error");
    expect(body.details.formErrors).toEqual([]);
    expect(Object.keys(body.details.fieldErrors)).toEqual(["brand"]);
  });
});
