import type { Metadata } from "next";

import { PayslipView } from "@/components/organisms";
import { loadPayslips } from "@/services/payslip/payslip.service.server";

export const metadata: Metadata = { title: "Payslip Recap" };

export default async function PayslipRecapPage() { return <PayslipView initialData={await loadPayslips()} />; }
