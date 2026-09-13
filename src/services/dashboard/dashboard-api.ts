import { z } from "zod";

import { createRouteFetcher } from "@/lib/route-fetcher";

const playerSchema = z.object({
  /** Null when the game server reported a player who has no members row. */
  member_id: z.number().int().positive().nullable(),
  discord_user_id: z.string(),
  username: z.string(),
  display_name: z.string(),
  character_name: z.string(),
  /** The player's CFX name, which is what `server_members.username` holds. */
  cfx_name: z.string(),
  /** Character id, and the slot the game server gave the visit that is open now. */
  cid: z.string(),
  server_id: z.string().nullable(),
  started_at: z.iso.datetime().nullable(),
  /** Game server presence: what the CR Roleplay webhook reported. */
  status: z.enum(["connecting", "connected", "offline"]),
  /** Live Discord presence, pulled from the bot and stored nowhere. */
  discord_status: z.enum(["online", "idle", "dnd", "offline", "invisible", "unknown"]),
  discord_playing: z.boolean(),
  discord_connecting: z.boolean(),
  current_playtime_seconds: z.number().int().nonnegative(),
  total_playtime_seconds: z.number().int().nonnegative(),
});

const cfxPlayerSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string(),
  ping: z.number().int().nonnegative(),
});

export const dashboardSchema = z.object({
  discord_players: z.array(playerSchema),
  player_threshold: z.number().int().nonnegative(),
  total_members: z.number().int().nonnegative(),
  total_playtime_seconds: z.number().int().nonnegative(),
  total_attended: z.number().int().nonnegative(),
  total_attendances: z.number().int().nonnegative(),
  cfx_players: z.array(cfxPlayerSchema),
  all_cfx_players: z.array(cfxPlayerSchema),
  cfx_available: z.boolean(),
  discord_presence_available: z.boolean(),
});

export type DashboardData = z.infer<typeof dashboardSchema>;

/**
 * Browser-side read of the dashboard through this app's own route handler,
 * which holds the app token. Validated with the same schema as the server path.
 */
export const fetchDashboardRoute = createRouteFetcher("/api/dashboard", dashboardSchema);

export async function fetchDashboard(baseURL: string, accessToken: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/dashboard", baseURL), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) {
    throw new Error(`Dashboard API returned ${response.status}`);
  }
  const parsed = dashboardSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Dashboard API returned invalid data");
  }
  return parsed.data;
}
