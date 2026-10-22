import "server-only";

import { routes } from "@/config/routes";
import { loadForMember } from "@/lib/session.server";

import { fetchOrderLog } from "./order-log-api";
export function loadOrderLog(before: string, kind: string) {
  return loadForMember(routes.orderLog, (url, token) => fetchOrderLog(url, token, before, kind));
}
