import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Alert = {
  id: string;
  source: string;
  trigger: string;
  context: Record<string, unknown> | null;
  createdAt: string;
};

type Props = {
  recent: Alert[];
};

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Berlin",
});

function snippet(context: Record<string, unknown> | null): string | null {
  if (!context) return null;
  const candidate =
    (context.snippet as string | undefined) ??
    (context.subject as string | undefined) ??
    (context.text as string | undefined) ??
    null;
  if (!candidate) return null;
  return candidate.length > 140 ? candidate.slice(0, 140) + "…" : candidate;
}

function sender(context: Record<string, unknown> | null): string | null {
  if (!context) return null;
  return (
    (context.sender as string | undefined) ??
    (context.from as string | undefined) ??
    (context.author as string | undefined) ??
    null
  );
}

function sourceBadge(source: string): string {
  if (source === "slack") return "Slack";
  if (source === "gmail") return "Gmail";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function MonitorCard({ recent }: Props) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          Monitor — last 24h
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground">No alerts in the last 24 hours</div>
        ) : (
          <ul className="space-y-3">
            {recent.map((a) => {
              const s = sender(a.context);
              const sn = snippet(a.context);
              return (
                <li key={a.id} className="border-l-2 border-muted pl-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {sourceBadge(a.source)}
                    </span>
                    <span className="font-medium">{a.trigger}</span>
                    {s ? <span className="text-muted-foreground">· {s}</span> : null}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {TIME_FMT.format(new Date(a.createdAt))}
                    </span>
                  </div>
                  {sn ? (
                    <div className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {sn}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
