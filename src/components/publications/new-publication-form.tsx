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
      locale: String(formData.get("locale") ?? "es-CO"),
      tone: String(formData.get("tone") ?? "Premium analítico"),
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
      setMessage(result.error ?? "No se pudo crear la tarea.");
      setBusy(false);
      return;
    }

    setMessage("Tarea creada y enviada a ingest.");
    startTransition(() => {
      router.push(`/publications/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label className="text-sm font-medium">URL fuente</label>
        <Input name="sourceUrl" placeholder="https://..." required />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Tipo de fuente</label>
          <Select name="sourceType" defaultValue="article">
            <option value="article">Artículo / noticia</option>
            <option value="youtube">YouTube</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Idioma</label>
          <Input name="locale" defaultValue="es-CO" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Marca</label>
          <Input name="brand" defaultValue="Antigravity" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Tono</label>
          <Input name="tone" defaultValue="Premium analítico" />
        </div>
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-medium">Canales destino</p>
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
          <p className="text-sm font-medium">Imagen IA opcional</p>
          <p className="text-xs text-muted-foreground">Activa generación sólo si el canal y el asset lo justifican.</p>
        </div>
        <input type="checkbox" name="useAiImage" defaultChecked className="h-5 w-5 rounded border-border text-primary" />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Notas editoriales</label>
        <Textarea placeholder="Brief, restricciones de tono, CTA, campaña o exclusiones." />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Creando..." : "Crear tarea"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <p className="text-xs leading-6 text-muted-foreground">
        Al crear esta tarea aceptas el tratamiento operativo de la URL y sus metadatos para orquestación,
        aprobación y auditoría. Conservamos estos registros por el tiempo necesario para soporte y trazabilidad.
        Consulta la <Link href="/privacidad" className="text-primary underline-offset-4 hover:underline">política de privacidad</Link>.
      </p>
    </form>
  );
}
