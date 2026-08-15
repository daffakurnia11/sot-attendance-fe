import { z } from "zod";

const settingsShape = {
  start_attendance: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_attendance: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  playtime_threshold: z.string().min(1),
  player_threshold: z.string().regex(/^\d+$/),
  payment_contract: z.string().regex(/^[1-9]\d*$/),
  attendance_minimum: z.string().regex(/^([1-9]|[12]\d|3[01])$/),
  attendance_maximum: z.string().regex(/^([1-9]|[12]\d|3[01])$/),
};

export const settingsValuesSchema = z.object(settingsShape).refine((values) => Number(values.attendance_minimum) <= Number(values.attendance_maximum), {
  message: "Attendance minimum must not exceed maximum",
  path: ["attendance_minimum"],
});

export const settingsSchema = z.object({ ...settingsShape, is_admin: z.boolean() }).refine((values) => Number(values.attendance_minimum) <= Number(values.attendance_maximum), {
  message: "Attendance minimum must not exceed maximum",
  path: ["attendance_minimum"],
});

export type SettingsData = z.infer<typeof settingsSchema>;
export type SettingsValues = z.infer<typeof settingsValuesSchema>;

export function formatIDRInput(value: string) {
  return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function normalizeCurrencyInput(value: string) {
  return value.replace(/\D/g, "");
}

export async function fetchSettings(baseURL: string, accessToken: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/settings", baseURL), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Settings API returned ${response.status}`);
  const parsed = settingsSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Settings API returned invalid data");
  return parsed.data;
}

export async function updateSettings(baseURL: string, accessToken: string, values: SettingsValues, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/settings", baseURL), {
    method: "PATCH",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(values),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = z.object({ error: z.object({ message: z.string() }) }).safeParse(payload);
    throw new Error(message.success ? message.data.error.message : `Settings API returned ${response.status}`);
  }
  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Settings API returned invalid data");
  return parsed.data;
}
