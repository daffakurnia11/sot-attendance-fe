import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchMoneyTransactions, moneyAccountSchema } from "@/services/money-transactions";

export const GET = memberRoute("Money transactions unavailable", async (accessToken, request) => {
  const account = moneyAccountSchema.safeParse(new URL(request.url).searchParams.get("account"));
  if (!account.success) return Response.json({ error: "Invalid account" }, { status: 400 });
  return Response.json(await fetchMoneyTransactions(goAPIURL, accessToken, account.data));
});
