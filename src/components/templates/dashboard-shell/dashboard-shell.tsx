"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/atoms";
import { cn } from "@/lib";

type DashboardShellProps = Readonly<{
  children: React.ReactNode;
  displayName: string;
  username: string;
  logoutAction: () => Promise<void>;
}>;

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: "DB" },
  { href: "/dashboard/activity", label: "My Activity", icon: "AC" },
  { href: "/dashboard/attendance", label: "My Attendance", icon: "AT" },
  { href: "/dashboard/settings", label: "Settings", icon: "ST" },
];

export function DashboardShell({ children, displayName, username, logoutAction }: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="dashboard-shell">
      <aside className={cn("dashboard-sidebar", menuOpen && "dashboard-sidebar--open")}>
        <div className="dashboard-brand">
          <Image src="/sot-logo.png" alt="Shade of Triads" width={60} height={67} priority />
          <div><strong>Shade of Triads</strong><span>Member system</span></div>
        </div>

        <nav aria-label="Member navigation">
          {menu.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn("dashboard-nav-item", active && "dashboard-nav-item--active")}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>

        <p className="dashboard-sidebar-foot">SOT / Attendance Hall</p>
      </aside>

      {menuOpen ? <button className="dashboard-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" /> : null}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">☰</button>
          <div className="dashboard-user">
            <span className="dashboard-avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
            <div><strong>{displayName}</strong><span>@{username}</span></div>
          </div>
          <form action={logoutAction}>
            <Button htmlType="submit" intent="secondary" className="dashboard-logout">Logout</Button>
          </form>
        </header>
        {children}
      </div>
    </main>
  );
}
