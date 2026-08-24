import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default async function DiscordPlayersPage() {
  redirect(routes.players.tabs.discord);
}
