import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, isAdminSession } from "@/lib/session.server";
import { fetchMoneyTransactions, moneyAccountSchema } from "@/services/money-transactions";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsedAccount = moneyAccountSchema.safeParse(new URL(request.url).searchParams.get("account"));
  if (!parsedAccount.success) return NextResponse.json({ error: "Invalid account" }, { status: 400 });
  try {
    return NextResponse.json(await fetchMoneyTransactions(goAPIURL, accessToken, parsedAccount.data));
  } catch {
    return NextResponse.json({ error: "Money transactions unavailable" }, { status: 502 });
  }
}
