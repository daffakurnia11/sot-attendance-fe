import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

import { routes } from "@/config/routes";
import { isDiscordAuthConfigured, serverEnv } from "@/lib/env.server";
import type { AppMember } from "@/services/auth";
import { BackendAuthError } from "@/services/auth";
import { authenticateDiscordMember } from "@/services/auth/auth.service.server";

type SafeAuthErrorCode = "AUTHENTICATION_FAILED" | "MEMBER_NOT_REGISTERED";

function safeAuthErrorCode(error: unknown): SafeAuthErrorCode {
  return error instanceof BackendAuthError && error.code === "MEMBER_NOT_REGISTERED"
    ? "MEMBER_NOT_REGISTERED"
    : "AUTHENTICATION_FAILED";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: serverEnv.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: isDiscordAuthConfigured
    ? [
        Discord({
          clientId: serverEnv.AUTH_DISCORD_ID!,
          clientSecret: serverEnv.AUTH_DISCORD_SECRET!,
        }),
      ]
    : [],
  pages: {
    signIn: routes.home,
    error: routes.auth.error,
  },
  callbacks: {
    async jwt({ account, token }) {
      if (account?.provider === "discord") {
        delete token.appAccessToken;
        delete token.appAccessTokenExpiresAt;
        delete token.authErrorCode;
        delete token.member;

        if (!account.access_token) {
          token.authErrorCode = "AUTHENTICATION_FAILED";
        } else {
          try {
            const backendAuth = await authenticateDiscordMember(account.access_token);
            if (backendAuth.member.discord_user_id !== account.providerAccountId) {
              token.authErrorCode = "AUTHENTICATION_FAILED";
            } else {
              token.appAccessToken = backendAuth.access_token;
              token.appAccessTokenExpiresAt = backendAuth.expires_at;
              token.member = backendAuth.member;
            }
          } catch (error) {
            token.authErrorCode = safeAuthErrorCode(error);
          }
        }
      }

      const accessTokenExpiresAt = token.appAccessTokenExpiresAt;
      if (typeof accessTokenExpiresAt === "string" && Date.parse(accessTokenExpiresAt) <= Date.now()) {
        delete token.appAccessToken;
        delete token.appAccessTokenExpiresAt;
        delete token.member;
        token.authErrorCode = "AUTHENTICATION_FAILED";
      }
      return token;
    },
    session({ session, token }) {
      session.authErrorCode = token.authErrorCode as SafeAuthErrorCode | undefined;
      session.user.member = token.member as AppMember | undefined;
      return session;
    },
    authorized({ auth, request }) {
      if (request.nextUrl.pathname === routes.home) {
        return true;
      }
      return Boolean(auth?.user?.member);
    },
  },
});
