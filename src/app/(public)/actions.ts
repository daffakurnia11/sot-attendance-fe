"use server";

import { signIn, signOut } from "@/auth";
import { routes } from "@/config/routes";

export async function signInWithDiscord() {
  await signIn("discord", { redirectTo: routes.dashboard });
}

export async function signOutFromDiscord() {
  await signOut({ redirectTo: routes.home });
}
