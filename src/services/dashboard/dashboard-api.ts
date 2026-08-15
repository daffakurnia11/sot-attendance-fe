import { z } from "zod";

const playerSchema = z.object({
  member_id: z.number().int().positive(),
  username: z.string(),
  display_name: z.string(),
  character_name: z.string(),
  started_at: z.iso.datetime().nullable(),
  status: z.enum(["connecting", "connected", "offline"]),
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
  cfx_available: z.boolean(),
});

export type DashboardData = z.infer<typeof dashboardSchema>;

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
