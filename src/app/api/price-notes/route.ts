import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchPriceNotes } from "@/services/price-notes";
export const GET = memberRoute("Price notes unavailable", async (token) =>
  Response.json(await fetchPriceNotes(goAPIURL, token)),
);
