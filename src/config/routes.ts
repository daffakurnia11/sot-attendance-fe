export const routes = {
  home: "/",
  dashboard: "/dashboard",
  myRecords: "/my-records",
  attendanceRecap: "/attendance-recap",
  attendanceCalendar: "/attendance-calendar",
  payslipRecap: "/payslip-recap",
  craftingCalculator: "/crafting-calculator",
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
