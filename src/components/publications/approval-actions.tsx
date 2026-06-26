"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import type { Channel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ApprovalActions({
  publicationId,
  channel,
}: {
  publicationId: string;
  channel?: Channel;
}) {
  const router = useRouter();
  const [reviewer, setReviewer] = useState("Laura Ops");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "approve" | "reject" | "request-approval" | "retry") {
    setBusyAction(action);
    setError(null);

    try {
      const response = await fetch(`/api/publications/${publicationId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer,
          channel,
          note:
            action === "approve"
              ? "Editorial approval recorded from the inbox."
              : action === "reject"
                ? "Request tone and CTA adjustments."
                : "Editorial gate raised for direct publishing.",
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? `Action failed (${response.status}). You may not have permission for this.`);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-3">
      <Input value={reviewer} onChange={(event) => setReviewer(event.target.value)} aria-label="Reviewer" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => submit("approve")} disabled={busyAction !== null}>
          {busyAction === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => submit("request-approval")} disabled={busyAction !== null}>
          Gate
        </Button>
        <Button size="sm" variant="danger" onClick={() => submit("reject")} disabled={busyAction !== null}>
          Reject
        </Button>
        <Button size="sm" variant="ghost" onClick={() => submit("retry")} disabled={busyAction !== null}>
          Retry
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
