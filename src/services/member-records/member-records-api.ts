import { z } from "zod";

const playerLogSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["connecting", "connected", "disconnected"]),
  started_at: z.iso.datetime().nullable(),
  occurred_at: z.iso.datetime(),
  playtime_seconds: z.number().int().nonnegative().nullable(),
});

const attendanceLogSchema = z.object({
  id: z.number().int().positive(),
  attendance_start: z.iso.datetime(),
  attendance_end: z.iso.datetime(),
  playtime_seconds: z.number().int().nonnegative(),
  required_playtime_seconds: z.number().int().positive(),
  is_attended: z.boolean(),
});

export const memberRecordsSchema = z.object({
  total_playtime_seconds: z.number().int().nonnegative(),
  total_attended: z.number().int().nonnegative(),
  total_attendances: z.number().int().nonnegative(),
  player_logs: z.array(playerLogSchema),
  attendance_logs: z.array(attendanceLogSchema),
});

export type MemberRecords = z.infer<typeof memberRecordsSchema>;

export async function fetchMemberRecords(baseURL: string, accessToken: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/me/records", baseURL), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Member records API returned ${response.status}`);
  const parsed = memberRecordsSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Member records API returned invalid data");
  return parsed.data;
}
