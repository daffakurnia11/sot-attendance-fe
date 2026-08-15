import { NextResponse } from "next/server";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken } from "@/lib/session.server";
import { fetchPayslips } from "@/services/payslip";

export async function GET(request: Request) {
  const accessToken = await getAppAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  try {
    return NextResponse.json(await fetchPayslips(goAPIURL, accessToken, month));
  } catch {
    return NextResponse.json({ error: "Payslips unavailable" }, { status: 502 });
  }
}
