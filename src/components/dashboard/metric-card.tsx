import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-display text-4xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
