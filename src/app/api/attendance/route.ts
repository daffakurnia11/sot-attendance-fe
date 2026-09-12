import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchAttendance } from "@/services/attendance";

// Roster-wide report. The Go API is the real gate and answers 403; checking
// here keeps the client from reading that as an upstream failure.
export const GET = memberRoute("Attendance unavailable", async (accessToken, request) => {
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  return Response.json(await fetchAttendance(goAPIURL, accessToken, month, fetch, false));
});
