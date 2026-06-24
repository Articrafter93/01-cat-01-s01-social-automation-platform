import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground shadow-inset outline-none transition-colors duration-180 focus:border-primary focus:ring-2 focus:ring-primary/20",
        props.className,
      )}
    />
  );
}
