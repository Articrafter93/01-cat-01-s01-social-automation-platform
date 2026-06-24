import type { Channel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function ChannelChip({ channel }: { channel: Channel }) {
  const variant =
    channel === "linkedin" || channel === "facebook" || channel === "instagram" ? "primary" : "muted";

  return <Badge variant={variant}>{channel}</Badge>;
}
