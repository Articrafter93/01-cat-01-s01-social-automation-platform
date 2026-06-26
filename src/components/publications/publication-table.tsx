import Link from "next/link";
import type { PublicationTask } from "@/lib/types";
import { ChannelChip } from "@/components/publications/channel-chip";
import { StatusBadge } from "@/components/publications/status-badge";

export function PublicationTable({ tasks }: { tasks: PublicationTask[] }) {
  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <article key={task.id} className="rounded-[24px] border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h3 className="break-words text-sm font-semibold leading-6 md:text-base">{task.title}</h3>
              <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">{task.sourceUrl}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {task.requestedChannels.map((channel) => (
              <ChannelChip key={`${task.id}-${channel}`} channel={channel} />
            ))}
          </div>

          <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl bg-background/60 p-3">
              <span className="block uppercase tracking-[0.16em]">Cost</span>
              <strong className="mt-1 block text-sm text-foreground">${task.metrics.totalEstimatedCostUsd.toFixed(2)}</strong>
            </div>
            <div className="rounded-2xl bg-background/60 p-3 sm:col-span-2">
              <span className="block uppercase tracking-[0.16em]">Last stage</span>
              <strong className="mt-1 block break-words text-sm text-foreground">{task.lastRunStage}</strong>
            </div>
          </div>

          <Link href={`/publications/${task.id}`} className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Open detail
          </Link>
        </article>
      ))}
    </div>
  );
}
