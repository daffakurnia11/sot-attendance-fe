import { z } from "zod";

import { createRouteFetcher } from "@/lib/route-fetcher";

export const moneyAccountSchema = z.enum(["office", "dirty"]);
export type MoneyAccount = z.infer<typeof moneyAccountSchema>;

const transactionSchema = z.object({
  id: z.number().int().positive(),
  account: moneyAccountSchema,
  type: z.enum(["opening", "deposit", "withdrawal", "reversal"]),
  direction: z.enum(["credit", "debit"]),
  amount: z.number().int().positive(),
  balance_before: z.number().int().nonnegative(),
  balance_after: z.number().int().nonnegative(),
  reason: z.string(),
  actor_member_id: z.number().int().positive(),
  actor_name: z.string(),
  actor_username: z.string(),
  created_at: z.iso.datetime(),
});

export const moneyTransactionsSchema = z.object({
  account: moneyAccountSchema,
  current_balance: z.number().int().nonnegative(),
  balances: z.object({
    office: z.number().int().nonnegative(),
    dirty: z.number().int().nonnegative(),
  }),
  transactions: z.array(transactionSchema),
});

export type MoneyTransactions = z.infer<typeof moneyTransactionsSchema>;

export const fetchOfficeMoneyTransactionsRoute = createRouteFetcher(
  "/api/money-transactions?account=office",
  moneyTransactionsSchema,
);
export const fetchDirtyMoneyTransactionsRoute = createRouteFetcher(
  "/api/money-transactions?account=dirty",
  moneyTransactionsSchema,
);

export async function fetchMoneyTransactions(
  baseURL: string,
  accessToken: string,
  account: MoneyAccount,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(new URL(`/api/v1/money-transactions/${account}`, baseURL), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Money transactions API returned ${response.status}`);
  const parsed = moneyTransactionsSchema.safeParse(await response.json());
  if (!parsed.success || parsed.data.account !== account) {
    throw new Error("Money transactions API returned invalid data");
  }
  return parsed.data;
}
