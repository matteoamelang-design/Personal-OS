import "server-only";
import { WebClient } from "@slack/web-api";

let cached: WebClient | null = null;

export function getSlack(): WebClient {
  if (cached) return cached;
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is not set");
  cached = new WebClient(token);
  return cached;
}

export async function postToDM(text: string, threadTs?: string) {
  const channel = process.env.SLACK_MATTEO_DM_CHANNEL;
  if (!channel) throw new Error("SLACK_MATTEO_DM_CHANNEL is not set");
  const slack = getSlack();
  const res = await slack.chat.postMessage({
    channel,
    text,
    thread_ts: threadTs,
  });
  return res;
}
