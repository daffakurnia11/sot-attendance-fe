import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PayslipView } from "@/components/organisms";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadPayslips } from "@/services/payslip/payslip.service.server";

export const metadata: Metadata = { title: "Payslip Recap" };

export default async function PayslipRecapPage() {
  // Roster-wide report: hiding the menu is not a control, so the page itself
  // turns non-admins away. The Go API rejects the request too.
  if (!(await isAdminSession())) redirect(routes.dashboard);

  return <PayslipView initialData={await loadPayslips()} />;
}
