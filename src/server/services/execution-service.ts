import { getSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { getDemoDashboardData, listDemoExecutions } from "@/server/repositories/demo-store";

type ExecutionEventRow = {
  id: string;
  task_id: string;
  stage: string;
  status: "ok" | "needs_approval" | "retryable_error" | "fatal_error" | "skipped";
  message: string;
  created_at: string;
  latency_ms: number;
  estimated_cost_usd: number;
};

type TaskStatusRow = {
  status: "draft" | "processing" | "needs_approval" | "approved" | "publishing" | "partially_published" | "published" | "failed";
};

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function listExecutions() {
  if (!hasSupabaseServerConfig()) {
    return listDemoExecutions();
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("execution_events").select("*").order("created_at", { ascending: false });
  assertNoError(error);

  return ((data as ExecutionEventRow[]) ?? []).map((event) => ({
    id: event.id,
    taskId: event.task_id,
    stage: event.stage,
    status: event.status,
    message: event.message,
    createdAt: event.created_at,
    latencyMs: event.latency_ms,
    estimatedCostUsd: event.estimated_cost_usd,
  }));
}

export async function getDashboardData() {
  if (!hasSupabaseServerConfig()) {
    return getDemoDashboardData();
  }

  const supabase = getSupabaseServerClient();
  const [{ data: tasks, error: taskError }, { data: recentEvents, error: eventError }] = await Promise.all([
    supabase.from("publication_tasks").select("status"),
    supabase.from("execution_events").select("*").order("created_at", { ascending: false }).limit(6),
  ]);

  assertNoError(taskError);
  assertNoError(eventError);

  const typedTasks = (tasks as TaskStatusRow[]) ?? [];
  const processed = typedTasks.length;
  const pending = typedTasks.filter((task) => ["draft", "processing", "needs_approval"].includes(task.status)).length;
  const approved = typedTasks.filter((task) => task.status === "approved").length;
  const published = typedTasks.filter((task) => task.status === "published").length;
  const failed = typedTasks.filter((task) => task.status === "failed").length;
  const tasksByStatus = typedTasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    metrics: {
      processed,
      pending,
      approved,
      published,
      failed,
      failureRate: processed === 0 ? 0 : failed / processed,
    },
    tasksByStatus,
    recentEvents: ((recentEvents as ExecutionEventRow[]) ?? []).map((event) => ({
      id: event.id,
      taskId: event.task_id,
      stage: event.stage,
      status: event.status,
      message: event.message,
      createdAt: event.created_at,
      latencyMs: event.latency_ms,
      estimatedCostUsd: event.estimated_cost_usd,
    })),
  };
}


