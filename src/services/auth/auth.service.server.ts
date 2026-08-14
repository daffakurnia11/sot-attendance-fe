import "server-only";

import { goAPIURL } from "@/lib/env.server";

import { exchangeDiscordToken } from "./auth-api";

export function authenticateDiscordMember(discordAccessToken: string) {
  return exchangeDiscordToken(goAPIURL, discordAccessToken);
}
