import "server-only";

if (!process.env.CRON_SECRET) {
  throw new Error("CRON_SECRET is not set");
}

// Vercel Cron sends: Authorization: Bearer ${CRON_SECRET}
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export function verifyCronAuth(request: Request): boolean {
  const header = request.headers.get("authorization");
  if (!header) return false;
  const expected = `Bearer ${process.env.CRON_SECRET!}`;
  return header === expected;
}
