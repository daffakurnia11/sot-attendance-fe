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
  moneyTransactions: {
    home: "/money-transactions",
    tabs: {
      office: "/money-transactions?account=office",
      dirty: "/money-transactions?account=dirty",
    },
  },
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
