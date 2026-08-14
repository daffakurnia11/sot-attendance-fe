import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/templates/dashboard-shell";
import { routes } from "@/config/routes";

import { logout } from "./actions";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const member = session?.user?.member;

  if (!member) {
    redirect(routes.home);
  }

  return (
    <DashboardShell
      displayName={member.display_name || member.username}
      username={member.username}
      logoutAction={logout}
    >
      {children}
    </DashboardShell>
  );
}
