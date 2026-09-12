import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchSafeboxTransactions } from "@/services/safebox-stock";

export const GET = memberRoute(
  "Safebox transactions unavailable",
  async (accessToken, request) => {
    const safebox = new URL(request.url).searchParams.get("safebox");
    if (safebox !== "public" && safebox !== "boss") {
      return Response.json({ error: "Safebox must be public or boss" }, { status: 400 });
    }
    return Response.json(await fetchSafeboxTransactions(goAPIURL, accessToken, safebox));
  },
  { admin: true },
);
