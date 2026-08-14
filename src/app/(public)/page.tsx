import { auth } from "@/auth";
import { LoginView } from "@/components/organisms";
import { content } from "@/data";
import { isDiscordAuthConfigured } from "@/lib/env.server";

import { signInWithDiscord, signOutFromDiscord } from "./actions";

type HomePageProps = {
  searchParams: Promise<{ code?: string; error?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  const authError =
    query.code === "MEMBER_NOT_REGISTERED" || session?.authErrorCode === "MEMBER_NOT_REGISTERED"
      ? "member-not-registered"
      : query.error || session?.authErrorCode
        ? "authentication"
        : null;

  return (
    <LoginView
      authError={authError}
      discordConfigured={isDiscordAuthConfigured}
      memberName={
        session?.user?.member
          ? (session.user.name ?? content.auth.fallbackMemberName)
          : null
      }
      signInAction={signInWithDiscord}
      signOutAction={signOutFromDiscord}
    />
  );
}
