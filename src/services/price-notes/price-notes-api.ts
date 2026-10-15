import { z } from "zod";

import { createRouteFetcher } from "@/lib/route-fetcher";
export const priceNotesSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int(),
      version: z.number().int().optional(),
      stock_item_id: z.number().int().optional(),
      stock_item_name: z.string().optional(),
      partner_code: z.string(),
      partner_name: z.string(),
      direction: z.enum(["purchase", "sale"]),
      name: z.string(),
      price: z.number().int().nonnegative(),
      unit: z.string(),
      notes: z.string(),
      stock_group: z.string().optional(),
    }),
  ),
});
export type PriceNotes = z.infer<typeof priceNotesSchema>;
export const fetchPriceNotesRoute = createRouteFetcher("/api/price-notes", priceNotesSchema);
export async function fetchPriceNotes(baseURL: string, accessToken: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/price-notes", baseURL), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Price notes could not be loaded.");
  return priceNotesSchema.parse(await response.json());
}

export const priceUpdateSchema = z.object({
  id: z.number().int().positive(),
  direction: z.enum(["purchase", "sale"]),
  version: z.number().int().positive(),
  price: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  unit: z.string().trim().min(1).max(50),
  notes: z.string().max(2000),
});
export async function updatePriceNote(baseURL: string, token: string, input: z.infer<typeof priceUpdateSchema>) {
  const response = await fetch(new URL("/api/v1/price-notes", baseURL), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(5000),
  });
  return response;
}
