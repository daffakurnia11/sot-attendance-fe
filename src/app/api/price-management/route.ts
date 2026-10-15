import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { priceUpdateSchema, updatePriceNote } from "@/services/price-notes";
export const PATCH = memberRoute(
  "Price management unavailable",
  async (token, request) => {
    const parsed = priceUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Invalid price, unit or notes" }, { status: 400 });
    const result = await updatePriceNote(goAPIURL, token, parsed.data);
    const payload: unknown = await result.json().catch(() => null);
    if (!result.ok) {
      const message = (payload as { error?: { message?: string } } | null)?.error?.message;
      return Response.json(
        { error: message ?? "Price could not be saved" },
        { status: result.status >= 400 && result.status < 500 ? result.status : 502 },
      );
    }
    return Response.json(payload);
  },
  { admin: true },
);
