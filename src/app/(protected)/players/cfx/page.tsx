import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function CFXPlayersPage() {
  redirect(routes.players.tabs.cfx);
}
