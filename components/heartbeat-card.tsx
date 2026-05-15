import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  lastAt: string | null;
  latencyMs: number | null;
  healthy: boolean;
};

const DATETIME_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Berlin",
});

function relativeAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function HeartbeatCard({ lastAt, latencyMs, healthy }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          Heartbeat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lastAt ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant={healthy ? "default" : "destructive"}>
                {healthy ? "🟢 Healthy" : "🔴 Stale"}
              </Badge>
              {latencyMs != null ? (
                <span className="text-sm text-muted-foreground tabular-nums">
                  {latencyMs} ms
                </span>
              ) : null}
            </div>
            <div className="pt-1 text-sm text-muted-foreground">
              {relativeAge(lastAt)}
            </div>
            <div className="text-xs text-muted-foreground">
              {DATETIME_FMT.format(new Date(lastAt))}
            </div>
          </>
        ) : (
          <>
            <Badge variant="destructive">🔴 No data</Badge>
            <div className="pt-1 text-sm text-muted-foreground">
              Cron has not reported yet
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
