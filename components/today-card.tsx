import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  briefingsToday: number;
  latestBriefing: { type: string; createdAt: string } | null;
};

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Berlin",
});

export function TodayCard({ briefingsToday, latestBriefing }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-semibold tabular-nums">{briefingsToday}</div>
        <div className="text-sm text-muted-foreground">
          briefing{briefingsToday === 1 ? "" : "s"} today
        </div>
        {latestBriefing ? (
          <div className="pt-1 text-sm">
            Latest:{" "}
            <span className="font-medium capitalize">{latestBriefing.type}</span>
            <span className="text-muted-foreground">
              {" "}
              · {TIME_FMT.format(new Date(latestBriefing.createdAt))}
            </span>
          </div>
        ) : (
          <div className="pt-1 text-sm text-muted-foreground">No briefings yet</div>
        )}
      </CardContent>
    </Card>
  );
}
