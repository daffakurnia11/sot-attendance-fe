import { z } from "zod";

const rupiahSchema = z.string().regex(/^\d+$/);

const payslipPlayerSchema = z.object({
  member_id: z.number().int().positive(),
  username: z.string(),
  display_name: z.string(),
  character_name: z.string(),
  attended_days: z.number().int().nonnegative(),
  eligible: z.boolean(),
  payout: rupiahSchema,
});

export const payslipReportSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  payment_contract: rupiahSchema,
  attendance_minimum: z.number().int().min(1).max(31),
  attendance_maximum: z.number().int().min(1).max(31),
  total_players: z.number().int().nonnegative(),
  eligible_players: z.number().int().nonnegative(),
  total_payout: rupiahSchema,
  players: z.array(payslipPlayerSchema),
});

export type PayslipReport = z.infer<typeof payslipReportSchema>;

export async function fetchPayslips(baseURL: string, accessToken: string, month?: string, fetcher: typeof fetch = fetch) {
  const url = new URL("/api/v1/payslips", baseURL);
  if (month) url.searchParams.set("month", month);
  const response = await fetcher(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Payslip API returned ${response.status}`);
  const parsed = payslipReportSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Payslip API returned invalid data");
  return parsed.data;
}
