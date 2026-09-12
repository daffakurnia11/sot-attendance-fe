import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchMoneyTransactions, type MoneyAccount } from "./money-transactions-api";

export function loadMoneyTransactions(account: MoneyAccount, path: string) {
  return loadForMember(path, (apiURL, accessToken) => fetchMoneyTransactions(apiURL, accessToken, account));
}
