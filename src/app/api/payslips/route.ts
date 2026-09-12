import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchPayslips } from "@/services/payslip";

// Roster-wide report. The Go API is the real gate and answers 403; checking
// here keeps the client from reading that as an upstream failure.
export const GET = memberRoute(
  "Payslips unavailable",
  async (accessToken, request) => {
    const month = new URL(request.url).searchParams.get("month") ?? undefined;
    return Response.json(await fetchPayslips(goAPIURL, accessToken, month));
  },
  { admin: true },
);
