import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";
import { fetchPayslips } from "@/services/payslip";

export async function GET(request: Request) {
  const token = await getToken({ req: request, secret: serverEnv.AUTH_SECRET });
  if (typeof token?.appAccessToken !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  try {
    return NextResponse.json(await fetchPayslips(goAPIURL, token.appAccessToken, month));
  } catch {
    return NextResponse.json({ error: "Payslips unavailable" }, { status: 502 });
  }
}
