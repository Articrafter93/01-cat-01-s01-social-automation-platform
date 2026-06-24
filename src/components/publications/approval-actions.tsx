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

  async function submit(action: "approve" | "reject" | "request-approval" | "retry") {
    setBusyAction(action);

    await fetch(`/api/publications/${publicationId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewer,
        channel,
        note:
          action === "approve"
            ? "Aprobación editorial registrada desde la bandeja."
            : action === "reject"
              ? "Solicitar ajustes de tono y CTA."
              : "Gate editorial levantado para publicación directa.",
      }),
    }).catch(() => null);

    startTransition(() => {
      router.refresh();
    });

    setBusyAction(null);
  }

  return (
    <div className="space-y-3">
      <Input value={reviewer} onChange={(event) => setReviewer(event.target.value)} aria-label="Reviewer" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => submit("approve")} disabled={busyAction !== null}>
          {busyAction === "approve" ? "Aprobando..." : "Aprobar"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => submit("request-approval")} disabled={busyAction !== null}>
          Gate
        </Button>
        <Button size="sm" variant="danger" onClick={() => submit("reject")} disabled={busyAction !== null}>
          Rechazar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => submit("retry")} disabled={busyAction !== null}>
          Retry
        </Button>
      </div>
    </div>
  );
}
