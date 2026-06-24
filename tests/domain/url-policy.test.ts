import { describe, expect, it } from "vitest";
import { assertSafeSourceUrl } from "@/lib/security/url-policy";

describe("assertSafeSourceUrl", () => {
  it("accepts a public https url", () => {
    expect(() => assertSafeSourceUrl("https://example.com/article")).not.toThrow();
  });

  it("blocks localhost", () => {
    expect(() => assertSafeSourceUrl("http://localhost:3000")).toThrow(/blocked/i);
  });

  it("enforces allowlists when provided", () => {
    expect(() => assertSafeSourceUrl("https://example.com/article", ["news.example.com"])).toThrow(/allowlist/i);
  });

  it("blocks the cloud metadata endpoint (169.254.169.254)", () => {
    expect(() => assertSafeSourceUrl("http://169.254.169.254/latest/meta-data/")).toThrow(/blocked/i);
  });

  it("blocks 0.0.0.0", () => {
    expect(() => assertSafeSourceUrl("http://0.0.0.0/")).toThrow(/blocked/i);
  });

  it("blocks IPv6 loopback", () => {
    expect(() => assertSafeSourceUrl("http://[::1]/")).toThrow(/blocked/i);
  });

  it("blocks IPv6 unique-local ranges", () => {
    expect(() => assertSafeSourceUrl("http://[fd00::1]/")).toThrow(/blocked/i);
  });

  it("blocks decimal-encoded loopback (2130706433 == 127.0.0.1)", () => {
    expect(() => assertSafeSourceUrl("http://2130706433/")).toThrow(/blocked/i);
  });

  it("blocks hex-encoded IP hosts", () => {
    expect(() => assertSafeSourceUrl("http://0x7f000001/")).toThrow(/blocked/i);
  });

  it("rejects non-http(s) protocols", () => {
    expect(() => assertSafeSourceUrl("ftp://example.com/file")).toThrow(/HTTP/i);
  });
});
