import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

import { routes } from "@/config/routes";
import { SESSION_COOKIE_CEILING_SECONDS } from "@/config/session";
import { isDiscordAuthConfigured, serverEnv } from "@/lib/env.server";
import type { AppMember } from "@/services/auth";
import { authenticateDiscordMember } from "@/services/auth/auth.service.server";
import {
  classifyDiscordAuthFailure,
  createAuthFailureReference,
  logAuthJsError,
  logDiscordAuthFailure,
  type SafeAuthErrorCode,
} from "@/services/auth/auth-observability.server";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: serverEnv.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    // A ceiling, not the session length. APP_JWT_TTL on the backend is the
    // single control: the jwt callback clears the session as soon as the app
    // token's expires_at passes, and the Go API rejects the token itself. Held
    // at the backend's own maximum so this cookie can never be the shorter of
    // the two, which is what made session length need editing in two repos.
    maxAge: SESSION_COOKIE_CEILING_SECONDS,
  },
  logger: {
    error(error) {
      logAuthJsError(error);
    },
  },
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
        delete token.authErrorReference;
        delete token.member;

        if (!account.access_token) {
          const reference = createAuthFailureReference();
          token.authErrorCode = "AUTHENTICATION_FAILED";
          token.authErrorReference = reference;
          logDiscordAuthFailure({
            failure: { code: "AUTHENTICATION_FAILED", internalCode: "MISSING_DISCORD_ACCESS_TOKEN" },
            phase: "missing_access_token",
            reference,
          });
        } else {
          try {
            const backendAuth = await authenticateDiscordMember(account.access_token);
            if (backendAuth.member.discord_user_id !== account.providerAccountId) {
              const reference = createAuthFailureReference();
              token.authErrorCode = "AUTHENTICATION_FAILED";
              token.authErrorReference = reference;
              logDiscordAuthFailure({
                failure: { code: "AUTHENTICATION_FAILED", internalCode: "DISCORD_IDENTITY_MISMATCH" },
                phase: "identity_verification",
                reference,
              });
            } else {
              token.appAccessToken = backendAuth.access_token;
              token.appAccessTokenExpiresAt = backendAuth.expires_at;
              token.member = backendAuth.member;
            }
          } catch (error) {
            const failure = classifyDiscordAuthFailure(error);
            const reference = createAuthFailureReference();
            token.authErrorCode = failure.code;
            token.authErrorReference = reference;
            logDiscordAuthFailure({ failure, phase: "backend_exchange", reference });
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
      session.authErrorReference = token.authErrorReference as string | undefined;
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
