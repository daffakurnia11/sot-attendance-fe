export const routes = {
  home: "/",
  dashboard: "/dashboard",
  myRecords: "/my-records",
  attendance: "/attendance",
  attendanceTabs: {
    recap: "/attendance?view=recap",
    calendar: "/attendance?view=calendar",
  },
  attendanceRecap: "/attendance-recap",
  attendanceCalendar: "/attendance-calendar",
  payslipRecap: "/payslip-recap",
  playerSearch: "/player-search",
  craftingCalculator: "/crafting-calculator",
  players: {
    home: "/players",
    tabs: {
      discord: "/players?view=discord",
      cfx: "/players?view=cfx",
    },
    discord: "/players/discord",
    cfx: "/players/cfx",
  },
  settings: "/settings",
  auth: {
    error: "/",
    discordCallback: "/api/auth/callback/discord",
  },
} as const;
