"use server";

import { signOut } from "@/auth";
import { routes } from "@/config/routes";

export async function logout() {
  await signOut({ redirectTo: routes.home });
}
