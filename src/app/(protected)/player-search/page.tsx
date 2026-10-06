import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function PlayerSearchPage() {
  redirect(routes.players.home);
}
