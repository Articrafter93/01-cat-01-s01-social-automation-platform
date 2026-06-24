import { promptTemplateUpdateSchema } from "@/lib/schemas";
import { getSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { listDemoIntegrations, listDemoPrompts, updateDemoPrompt } from "@/server/repositories/demo-store";

type PromptTemplateRow = {
  id: string;
  brand: string;
  channel: string;
  locale: string;
  content_type: string;
  version: number;
  status: "draft" | "active";
  template: string;
};

type IntegrationBindingRow = {
  id: string;
  provider: string;
  environment: "dev" | "staging" | "prod";
  status: "healthy" | "warning" | "disconnected";
  scopes: string[];
  last_rotated_at: string;
};

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function listPrompts() {
  if (!hasSupabaseServerConfig()) {
    return listDemoPrompts();
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("brand", { ascending: true })
    .order("channel", { ascending: true })
    .order("version", { ascending: false });

  assertNoError(error);

  return ((data as PromptTemplateRow[]) ?? []).map((prompt) => ({
    id: prompt.id,
    brand: prompt.brand,
    channel: prompt.channel,
    locale: prompt.locale,
    contentType: prompt.content_type,
    version: prompt.version,
    status: prompt.status,
    template: prompt.template,
  }));
}

export async function updatePrompt(id: string, input: unknown) {
  const parsed = promptTemplateUpdateSchema.parse(input);

  if (!hasSupabaseServerConfig()) {
    return updateDemoPrompt(id, parsed);
  }

  const supabase = getSupabaseServerClient();
  const updatePayload = {
    ...(parsed.status ? { status: parsed.status } : {}),
    ...(parsed.template ? { template: parsed.template } : {}),
    ...(parsed.locale ? { locale: parsed.locale } : {}),
  };

  const { data, error } = await supabase.from("prompt_templates").update(updatePayload).eq("id", id).select("*").single();

  if (error?.message?.includes("0 rows")) {
    return null;
  }

  assertNoError(error);

  const prompt = data as PromptTemplateRow;
  return {
    id: prompt.id,
    brand: prompt.brand,
    channel: prompt.channel,
    locale: prompt.locale,
    contentType: prompt.content_type,
    version: prompt.version,
    status: prompt.status,
    template: prompt.template,
  };
}

export async function listIntegrations() {
  if (!hasSupabaseServerConfig()) {
    return listDemoIntegrations();
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("integration_bindings").select("*").order("provider", { ascending: true });
  assertNoError(error);

  return ((data as IntegrationBindingRow[]) ?? []).map((integration) => ({
    id: integration.id,
    provider: integration.provider,
    environment: integration.environment,
    status: integration.status,
    scopes: integration.scopes,
    lastRotatedAt: integration.last_rotated_at,
  }));
}


