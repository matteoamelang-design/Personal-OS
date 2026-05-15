import "server-only";
import { getSupabase } from "@/lib/supabase";

export type DashboardData = {
  today: {
    briefingsToday: number;
    latestBriefing: { type: string; createdAt: string; content: string } | null;
  };
  pending: {
    pendingDrafts: number;
    byChannel: Record<string, number>;
  };
  heartbeat: {
    lastAt: string | null;
    latencyMs: number | null;
    healthy: boolean;
  };
  evals: {
    totalRuns: number;
    avgLatencyMs: number | null;
    totalCostUsd: number;
    perWorkflow: Array<{
      workflow: string;
      runs: number;
      avgQuality: number | null;
    }>;
  };
  errors: string[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabase();
  const errors: string[] = [];

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [briefingsRes, draftsRes, heartbeatRes, evalsRes] = await Promise.all([
    supabase
      .from("briefings")
      .select("id, type, content, created_at")
      .gte("created_at", startOfToday.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("drafts")
      .select("id, channel", { count: "exact" })
      .eq("status", "pending"),
    supabase
      .from("eval_scores")
      .select("created_at, latency_ms")
      .eq("workflow", "heartbeat")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("eval_scores")
      .select("workflow, latency_ms, cost_usd, quality_score")
      .gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  // Today
  let today: DashboardData["today"] = { briefingsToday: 0, latestBriefing: null };
  if (briefingsRes.error) {
    errors.push(`briefings: ${briefingsRes.error.message}`);
  } else {
    const rows = briefingsRes.data ?? [];
    today = {
      briefingsToday: rows.length,
      latestBriefing: rows[0]
        ? {
            type: rows[0].type as string,
            createdAt: rows[0].created_at as string,
            content: rows[0].content as string,
          }
        : null,
    };
  }

  // Pending drafts
  let pending: DashboardData["pending"] = { pendingDrafts: 0, byChannel: {} };
  if (draftsRes.error) {
    errors.push(`drafts: ${draftsRes.error.message}`);
  } else {
    const rows = (draftsRes.data ?? []) as Array<{ channel: string }>;
    const byChannel: Record<string, number> = {};
    for (const r of rows) {
      byChannel[r.channel] = (byChannel[r.channel] ?? 0) + 1;
    }
    pending = {
      pendingDrafts: draftsRes.count ?? rows.length,
      byChannel,
    };
  }

  // Heartbeat
  let heartbeat: DashboardData["heartbeat"] = {
    lastAt: null,
    latencyMs: null,
    healthy: false,
  };
  if (heartbeatRes.error) {
    errors.push(`heartbeat: ${heartbeatRes.error.message}`);
  } else if (heartbeatRes.data) {
    const lastAt = heartbeatRes.data.created_at as string;
    const ageMs = now.getTime() - new Date(lastAt).getTime();
    heartbeat = {
      lastAt,
      latencyMs: (heartbeatRes.data.latency_ms as number | null) ?? null,
      healthy: ageMs < 24 * 60 * 60 * 1000,
    };
  }

  // 7-day evals
  let evals: DashboardData["evals"] = {
    totalRuns: 0,
    avgLatencyMs: null,
    totalCostUsd: 0,
    perWorkflow: [],
  };
  if (evalsRes.error) {
    errors.push(`evals: ${evalsRes.error.message}`);
  } else {
    const rows = (evalsRes.data ?? []) as Array<{
      workflow: string;
      latency_ms: number | null;
      cost_usd: number | string | null;
      quality_score: number | string | null;
    }>;
    const totalRuns = rows.length;
    const latencies = rows.map((r) => r.latency_ms).filter((v): v is number => typeof v === "number");
    const avgLatencyMs =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : null;
    const totalCostUsd = rows.reduce((sum, r) => sum + Number(r.cost_usd ?? 0), 0);

    const grouped = new Map<string, { runs: number; qualitySum: number; qualityCount: number }>();
    for (const r of rows) {
      const g = grouped.get(r.workflow) ?? { runs: 0, qualitySum: 0, qualityCount: 0 };
      g.runs += 1;
      const q = r.quality_score == null ? null : Number(r.quality_score);
      if (q != null && !Number.isNaN(q)) {
        g.qualitySum += q;
        g.qualityCount += 1;
      }
      grouped.set(r.workflow, g);
    }
    const perWorkflow = Array.from(grouped.entries())
      .map(([workflow, g]) => ({
        workflow,
        runs: g.runs,
        avgQuality: g.qualityCount > 0 ? Number((g.qualitySum / g.qualityCount).toFixed(1)) : null,
      }))
      .sort((a, b) => b.runs - a.runs);

    evals = { totalRuns, avgLatencyMs, totalCostUsd, perWorkflow };
  }

  return { today, pending, heartbeat, evals, errors };
}
