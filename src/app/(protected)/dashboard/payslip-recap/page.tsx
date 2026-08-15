import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function PayslipRecapPage() {
  redirect(routes.payslipRecap);
}
