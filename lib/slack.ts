import "server-only";
import { WebClient } from "@slack/web-api";

if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN is not set");
}
if (!process.env.SLACK_MATTEO_DM_CHANNEL) {
  throw new Error("SLACK_MATTEO_DM_CHANNEL is not set");
}

let cached: WebClient | null = null;

export function getSlack(): WebClient {
  if (cached) return cached;
  cached = new WebClient(process.env.SLACK_BOT_TOKEN!);
  return cached;
}

export async function postToDM(text: string, threadTs?: string) {
  const slack = getSlack();
  const res = await slack.chat.postMessage({
    channel: process.env.SLACK_MATTEO_DM_CHANNEL!,
    text,
    thread_ts: threadTs,
  });
  return res;
}
