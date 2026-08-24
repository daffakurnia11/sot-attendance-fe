import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function DiscordPlayersPage() {
  redirect(routes.players.tabs.discord);
}
