import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  pendingDrafts: number;
  byChannel: Record<string, number>;
};

export function PendingCard({ pendingDrafts, byChannel }: Props) {
  const entries = Object.entries(byChannel).sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          Pending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-semibold tabular-nums">{pendingDrafts}</div>
        <div className="text-sm text-muted-foreground">drafts awaiting approval</div>
        {entries.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entries.map(([channel, count]) => (
              <Badge key={channel} variant="secondary" className="capitalize">
                {channel} · {count}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="pt-1 text-sm text-muted-foreground">Nothing waiting</div>
        )}
      </CardContent>
    </Card>
  );
}
