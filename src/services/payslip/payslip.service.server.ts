import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

import { goAPIURL, serverEnv } from "@/lib/env.server";

import { fetchPayslips } from "./payslip-api";

export async function loadPayslips() {
  const requestHeaders = await headers();
  const token = await getToken({ req: new Request("http://localhost/payslip-recap", { headers: requestHeaders }), secret: serverEnv.AUTH_SECRET });
  if (typeof token?.appAccessToken !== "string") return null;
  return fetchPayslips(goAPIURL, token.appAccessToken).catch(() => null);
}
