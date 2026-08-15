export const routes = {
  home: "/",
  dashboard: "/dashboard",
  myRecords: "/my-records",
  attendanceRecap: "/attendance-recap",
  payslipRecap: "/payslip-recap",
  players: {
    discord: "/players/discord",
    cfx: "/players/cfx",
  },
  settings: "/settings",
  auth: {
    error: "/",
    discordCallback: "/api/auth/callback/discord",
  },
} as const;
