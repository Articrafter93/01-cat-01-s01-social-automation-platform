import type { PublicationStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const variants: Record<PublicationStatus, "muted" | "primary" | "success" | "warning" | "danger"> = {
  draft: "muted",
  processing: "primary",
  needs_approval: "warning",
  approved: "success",
  publishing: "primary",
  partially_published: "warning",
  published: "success",
  failed: "danger",
};

export function StatusBadge({ status }: { status: PublicationStatus }) {
  return (
    <Badge variant={variants[status]}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
