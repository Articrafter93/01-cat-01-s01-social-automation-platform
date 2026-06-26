"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const channels = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
];

export function NewPublicationForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setBusy(true);
    setMessage(null);

    const requestedChannels = formData
      .getAll("requestedChannels")
      .map((value) => String(value));

    const payload = {
      sourceUrl: String(formData.get("sourceUrl") ?? ""),
      sourceType: String(formData.get("sourceType") ?? "article"),
      brand: String(formData.get("brand") ?? "Antigravity"),
      locale: String(formData.get("locale") ?? "en-US"),
      tone: String(formData.get("tone") ?? "Analytical premium"),
      useAiImage: formData.get("useAiImage") === "on",
      requestedChannels,
    };

    const response = await fetch("/api/publications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "Could not create the task.");
      setBusy(false);
      return;
    }

    setMessage("Task created and sent to ingest.");
    startTransition(() => {
      router.push(`/publications/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Source URL</label>
        <Input name="sourceUrl" placeholder="https://..." required />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Source type</label>
          <Select name="sourceType" defaultValue="article">
            <option value="article">Article / news</option>
            <option value="youtube">YouTube</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Language</label>
          <Input name="locale" defaultValue="en-US" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Brand</label>
          <Input name="brand" defaultValue="Antigravity" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Tone</label>
          <Input name="tone" defaultValue="Analytical premium" />
        </div>
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-medium">Target channels</p>
        <div className="grid gap-3 rounded-[24px] border border-border bg-background/60 p-4 md:grid-cols-3">
          {channels.map((channel) => (
            <label key={channel.value} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="requestedChannels"
                value={channel.value}
                defaultChecked={["linkedin", "facebook", "instagram"].includes(channel.value)}
                className="h-4 w-4 rounded border-border text-primary"
              />
              {channel.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-border bg-background/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Optional AI image</p>
          <p className="text-xs text-muted-foreground">Enable generation only if the channel and the asset justify it.</p>
        </div>
        <input type="checkbox" name="useAiImage" defaultChecked className="h-5 w-5 rounded border-border text-primary" />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Editorial notes</label>
        <Textarea placeholder="Brief, tone constraints, CTA, campaign or exclusions." />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create task"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <p className="text-xs leading-6 text-muted-foreground">
        By creating this task you accept the operational processing of the URL and its metadata for orchestration,
        approval and auditing. We keep these records for as long as needed for support and traceability.
        See the <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">privacy policy</Link>.
      </p>
    </form>
  );
}
