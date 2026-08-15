import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchPayslips } from "./payslip-api";

export async function loadPayslips() {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), "/payslip-recap"));
  if (!accessToken) return null;
  return fetchPayslips(goAPIURL, accessToken).catch(() => null);
}
