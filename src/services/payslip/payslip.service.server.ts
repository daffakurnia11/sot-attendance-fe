import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchPayslips } from "./payslip-api";

export function loadPayslips() {
  return loadForMember("/payslip-recap", fetchPayslips);
}
