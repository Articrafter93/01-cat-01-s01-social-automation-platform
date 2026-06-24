import type { ExecutionEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const badgeMap = {
  ok: "success",
  needs_approval: "warning",
  retryable_error: "warning",
  fatal_error: "danger",
  skipped: "muted",
} as const;

export function ExecutionTimeline({ events }: { events: ExecutionEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="rounded-[22px] border border-border bg-background/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{event.stage}</p>
              <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
            </div>
            <Badge variant={badgeMap[event.status]}>{event.status.replaceAll("_", " ")}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{new Date(event.createdAt).toLocaleString("es-CO")}</span>
            <span>{event.latencyMs} ms</span>
            <span>${event.estimatedCostUsd.toFixed(2)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
