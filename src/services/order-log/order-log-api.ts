import { z } from "zod";

export const orderLogSchema = z.object({
  orders: z.array(
    z.object({
      id: z.number().int(),
      kind: z.enum(["sale", "purchase", "internal"]),
      partner: z.string(),
      buyer: z.string(),
      status: z.string(),
      order_date: z.string(),
      pickup_date: z.string(),
      additional: z.number(),
      total: z.number(),
      notes: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
      created_by: z.string(),
      items: z.array(z.object({ name: z.string(), unit: z.string(), price: z.number(), quantity: z.number() })),
    }),
  ),
  next_before: z.number().int().nonnegative(),
});
export type OrderLog = z.infer<typeof orderLogSchema>;
export async function fetchOrderLog(baseURL: string, token: string, before = "", kind = "") {
  const url = new URL("/api/v1/order-log", baseURL);
  if (kind) url.searchParams.set("kind", kind);
  if (before) url.searchParams.set("before", before);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Order log could not be loaded.");
  return orderLogSchema.parse(await response.json());
}
