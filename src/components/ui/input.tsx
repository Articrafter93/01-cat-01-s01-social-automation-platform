import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const accessibleLabel = props["aria-label"] ?? props.name ?? "input";
  return (
    <input
      {...props}
      aria-label={accessibleLabel}
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground shadow-inset outline-none transition-colors duration-180 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
        props.className,
      )}
    />
  );
}
