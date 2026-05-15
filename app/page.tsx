import { getDashboardData } from "@/lib/dashboard-query";
import { TodayCard } from "@/components/today-card";
import { PendingCard } from "@/components/pending-card";
import { HeartbeatCard } from "@/components/heartbeat-card";
import { EvalCard } from "@/components/eval-card";
import { PrepCard } from "@/components/prep-card";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const HEADER_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "short",
  timeZone: "Europe/Berlin",
});

export default async function Home() {
  const data = await getDashboardData();
  const headerDate = HEADER_FMT.format(new Date());

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <header className="mb-6 flex flex-col gap-1 sm:mb-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Personal OS
          </h1>
          <p className="text-sm text-muted-foreground">{headerDate}</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TodayCard
            briefingsToday={data.today.briefingsToday}
            latestBriefing={data.today.latestBriefing}
          />
          <PendingCard
            pendingDrafts={data.pending.pendingDrafts}
            byChannel={data.pending.byChannel}
          />
          <HeartbeatCard
            lastAt={data.heartbeat.lastAt}
            latencyMs={data.heartbeat.latencyMs}
            healthy={data.heartbeat.healthy}
          />
          <EvalCard
            totalRuns={data.evals.totalRuns}
            avgLatencyMs={data.evals.avgLatencyMs}
            totalCostUsd={data.evals.totalCostUsd}
            perWorkflow={data.evals.perWorkflow}
          />
          <PrepCard nextMeeting={data.upcoming.nextMeeting} />
        </div>

        {data.errors.length > 0 ? (
          <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
            <div className="font-medium">Data errors:</div>
            <ul className="mt-1 list-disc pl-5">
              {data.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}
