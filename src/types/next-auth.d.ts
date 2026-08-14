import type { DefaultSession } from "next-auth";

import type { AppMember } from "@/services/auth";

declare module "next-auth" {
  interface Session {
    authErrorCode?: "AUTHENTICATION_FAILED" | "MEMBER_NOT_REGISTERED";
    user: DefaultSession["user"] & {
      member?: AppMember;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    appAccessToken?: string;
    appAccessTokenExpiresAt?: string;
    authErrorCode?: "AUTHENTICATION_FAILED" | "MEMBER_NOT_REGISTERED";
    member?: AppMember;
  }
}
