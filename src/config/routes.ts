export const routes = {
  home: "/",
  dashboard: "/dashboard",
  auth: {
    error: "/",
    discordCallback: "/api/auth/callback/discord",
  },
} as const;
