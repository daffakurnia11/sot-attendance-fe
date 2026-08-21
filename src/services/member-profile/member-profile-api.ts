import { z } from "zod";

export const memberProfileSchema = z.object({
  character_name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .refine((value) => !/[\r\n\0]/.test(value)),
});
export type MemberProfile = z.infer<typeof memberProfileSchema>;

export async function updateMemberProfile(
  baseURL: string,
  accessToken: string,
  profile: MemberProfile,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(new URL("/api/v1/me/profile", baseURL), {
    method: "PATCH",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(profile),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = z.object({ error: z.object({ message: z.string() }) }).safeParse(payload);
    throw new Error(error.success ? error.data.error.message : `Profile API returned ${response.status}`);
  }
  const parsed = memberProfileSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Profile API returned invalid data");
  return parsed.data;
}
