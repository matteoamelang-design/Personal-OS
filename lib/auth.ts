import "server-only";

// Vercel Cron sends: Authorization: Bearer ${CRON_SECRET}
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export function verifyCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is not set");
  const header = request.headers.get("authorization");
  if (!header) return false;
  return header === `Bearer ${secret}`;
}
