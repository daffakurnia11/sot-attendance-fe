import { goAPIURL } from "@/lib/env.server";
import { selectMemberAttendance } from "@/lib/member-attendance";
import { memberRoute } from "@/lib/session.server";
import { fetchAttendance } from "@/services/attendance";

export const GET = memberRoute("Attendance unavailable", async (token, request) => {
  const params = new URL(request.url).searchParams;
  const target = params.get("discord_user_id") ?? "";
  if (!/^\d{1,20}$/.test(target)) return Response.json({ error: "Invalid member" }, { status: 400 });
  const report = selectMemberAttendance(
    await fetchAttendance(goAPIURL, token, params.get("month") ?? undefined),
    target,
  );
  if (!report.members.length) return Response.json({ error: "Member not found" }, { status: 404 });
  return Response.json(report);
});
