import { goAPIURL } from "@/lib/env.server";
import { memberRoute } from "@/lib/session.server";
import { fetchDashboard } from "@/services/dashboard";

export const GET = memberRoute("Dashboard unavailable", async (accessToken) =>
  Response.json(await fetchDashboard(goAPIURL, accessToken)),
);
