import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchOrderLog } from "@/services/order-log";
export async function GET(request: Request) {
  const before = new URL(request.url).searchParams.get("before") ?? "";
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  return memberRoute("Order log unavailable", async (token) =>
    Response.json(await fetchOrderLog(goAPIURL, token, before, kind)),
  )(request);
}
