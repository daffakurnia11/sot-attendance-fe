import type { DefaultSession } from "next-auth";

import type { AppMember } from "@/services/auth";

declare module "next-auth" {
  interface Session {
    authErrorCode?: "AUTHENTICATION_FAILED" | "AUTH_SERVICE_UNAVAILABLE" | "MEMBER_NOT_REGISTERED";
    authErrorReference?: string;
    user: DefaultSession["user"] & {
      member?: AppMember;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    appAccessToken?: string;
    appAccessTokenExpiresAt?: string;
    authErrorCode?: "AUTHENTICATION_FAILED" | "AUTH_SERVICE_UNAVAILABLE" | "MEMBER_NOT_REGISTERED";
    authErrorReference?: string;
    member?: AppMember;
  }
}
