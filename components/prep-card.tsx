import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  nextMeeting: {
    eventId: string;
    eventTitle: string | null;
    eventStart: string | null;
    brief: string;
  } | null;
};

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Berlin",
});

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "Europe/Berlin",
});

function minutesUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

export function PrepCard({ nextMeeting }: Props) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          Next Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nextMeeting ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-base font-semibold">
                {nextMeeting.eventTitle ?? "Meeting"}
              </span>
              {nextMeeting.eventStart ? (
                <span className="text-sm text-muted-foreground">
                  {DATE_FMT.format(new Date(nextMeeting.eventStart))}{" "}
                  {TIME_FMT.format(new Date(nextMeeting.eventStart))}
                  {" · "}
                  {minutesUntil(nextMeeting.eventStart) <= 0
                    ? "now"
                    : `in ${minutesUntil(nextMeeting.eventStart)} min`}
                </span>
              ) : null}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
              {nextMeeting.brief}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No upcoming meetings prepped</div>
        )}
      </CardContent>
    </Card>
  );
}
