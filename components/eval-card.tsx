import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalRuns: number;
  avgLatencyMs: number | null;
  totalCostUsd: number;
  perWorkflow: Array<{ workflow: string; runs: number; avgQuality: number | null }>;
};

const COST_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function EvalCard({ totalRuns, avgLatencyMs, totalCostUsd, perWorkflow }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          Evals · 7 days
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div>
            <div className="text-4xl font-semibold tabular-nums">{totalRuns}</div>
            <div className="text-xs text-muted-foreground">runs</div>
          </div>
          <div>
            <div className="text-lg font-medium tabular-nums">
              {avgLatencyMs != null ? `${avgLatencyMs} ms` : "—"}
            </div>
            <div className="text-xs text-muted-foreground">avg latency</div>
          </div>
          <div>
            <div className="text-lg font-medium tabular-nums">
              {COST_FMT.format(totalCostUsd)}
            </div>
            <div className="text-xs text-muted-foreground">cost</div>
          </div>
        </div>

        {perWorkflow.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {perWorkflow.slice(0, 5).map((w) => (
              <li key={w.workflow} className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{w.workflow}</span>
                <span className="text-muted-foreground tabular-nums">
                  {w.runs} run{w.runs === 1 ? "" : "s"}
                  {w.avgQuality != null ? ` · ${w.avgQuality.toFixed(1)}/5` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">No eval data yet</div>
        )}
      </CardContent>
    </Card>
  );
}
