import "server-only";

import { headers } from "next/headers";

import { goAPIURL } from "@/lib/env.server";
import { getAppAccessToken, requestFromHeaders } from "@/lib/session.server";

import { fetchMoneyTransactions, type MoneyAccount } from "./money-transactions-api";

export async function loadMoneyTransactions(account: MoneyAccount, path: string) {
  const accessToken = await getAppAccessToken(requestFromHeaders(await headers(), path));
  if (!accessToken) return null;
  return fetchMoneyTransactions(goAPIURL, accessToken, account).catch(() => null);
}
