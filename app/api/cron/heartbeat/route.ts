import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const timestamp = new Date().toISOString();

  const supabase = getSupabase();
  const { error } = await supabase.from("eval_scores").insert({
    workflow: "heartbeat",
    run_id: null,
    tokens_in: 0,
    tokens_out: 0,
    cost_usd: 0,
    latency_ms: Date.now() - startedAt,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, db_error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, timestamp });
}
