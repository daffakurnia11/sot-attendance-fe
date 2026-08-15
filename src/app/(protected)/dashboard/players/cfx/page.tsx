import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default async function CFXPlayersPage() {
  redirect(routes.players.cfx);
}
