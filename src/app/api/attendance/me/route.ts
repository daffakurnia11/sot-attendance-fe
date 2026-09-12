import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchAttendance } from "@/services/attendance";

export const GET = memberRoute("Attendance unavailable", async (accessToken, request) => {
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  return Response.json(await fetchAttendance(goAPIURL, accessToken, month, fetch, true));
});
