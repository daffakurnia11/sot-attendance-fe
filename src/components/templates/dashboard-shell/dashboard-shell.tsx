"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button, LanguageSwitcher } from "@/components/atoms";
import { routes } from "@/config/routes";
import { useI18n } from "@/i18n";
import { cn } from "@/lib";

type DashboardShellProps = Readonly<{
  children: React.ReactNode;
  isAdmin: boolean;
  displayName: string;
  username: string;
  logoutAction: () => Promise<void>;
}>;

const menuGroups = [
  {
    label: "Overview",
    items: [
      { href: routes.dashboard, label: "Dashboard", icon: "DB" },
      { href: routes.myRecords, label: "My Records", icon: "MR" },
    ],
  },
  {
    label: "Attendance & Payouts",
    // Roster-wide views: every member's attendance and everyone's payout.
    adminOnly: true,
    items: [
      { href: routes.attendanceTabs.recap, label: "Attendance", icon: "AT" },
      { href: routes.players.tabs.discord, label: "Player Logs", icon: "PL" },
      { href: routes.payslipRecap, label: "Payslip Recap", icon: "PR" },
    ],
  },
  {
    label: "Business Zone",
    items: [{ href: routes.craftingCalculator, label: "Crafting Calculator", icon: "CC" }],
  },
  {
    label: "System",
    items: [{ href: routes.settings, label: "Settings", icon: "ST" }],
  },
];

export function DashboardShell({ children, displayName, isAdmin, username, logoutAction }: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, translate } = useI18n();

  return (
    <main className="min-h-dvh bg-[linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),var(--color-background)] bg-[size:64px_64px]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[270px] -translate-x-full flex-col border-r border-[var(--color-border)] bg-[rgba(13,10,6,.97)] px-[18px] py-6 transition-transform duration-200 lg:translate-x-0",
          menuOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 px-2 pb-7">
          <Image
            className="h-[58px] w-[52px] object-contain"
            src="/sot-logo.png"
            alt="Shade of Triads"
            width={60}
            height={67}
            priority
          />
          <div className="flex min-w-0 flex-col">
            <strong className="font-[Impact] text-[19px] tracking-[.04em] uppercase">Shade of Triads</strong>
            <span className="text-xs tracking-[.12em] text-[var(--color-foreground-muted)]">{t("Member system")}</span>
          </div>
        </div>

        <nav className="grid content-start gap-6 overflow-y-auto" aria-label={t("Member navigation")}>
          {menuGroups
            .filter((group) => isAdmin || !("adminOnly" in group))
            .map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3.5 text-xs leading-none font-extrabold tracking-[.22em] text-[var(--color-primary-muted)] uppercase">
                  {translate(group.label)}
                </p>
                <div className="grid gap-1.5">
                  {group.items.map((item) => {
                    const active = item.href.split("?")[0] === pathname;
                    return (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-[13px] rounded-[7px] border border-transparent px-3.5 py-3 text-[13px] font-extrabold tracking-[.06em] text-[var(--color-foreground-muted)] uppercase no-underline transition-colors hover:bg-[rgba(242,182,61,.06)] hover:text-[var(--color-foreground)]",
                          active &&
                            "border-[var(--color-border)] bg-[linear-gradient(90deg,rgba(242,182,61,.14),transparent)] text-[var(--color-primary-bright)]",
                        )}
                        href={item.href}
                        key={item.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span
                          className="grid h-7 w-7 place-items-center border border-[var(--color-border)] text-xs text-[var(--color-primary-muted)]"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        {translate(item.label)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
        </nav>

        <p className="mt-auto border-t border-[var(--color-border)] px-2.5 pt-5 text-xs font-extrabold tracking-[.25em] text-[var(--color-primary-muted)] uppercase">
          {t("SOT / Attendance Hall")}
        </p>
      </aside>

      {menuOpen ? (
        <button
          className="fixed inset-0 z-25 border-0 bg-black/70 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label={t("Close navigation")}
        />
      ) : null}

      <div className="min-h-dvh lg:pl-[270px]">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-end gap-[18px] border-b border-[var(--color-border)] bg-[rgba(7,6,5,.88)] px-4 py-2.5 backdrop-blur-2xl sm:px-6">
          <button
            className="mr-auto grid h-10 w-10 place-items-center rounded-md border border-[var(--color-border)] bg-transparent text-xl text-[var(--color-primary)] lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={t("Open navigation")}
          >
            ☰
          </button>
          <LanguageSwitcher />
          <div className="flex items-center gap-[11px]">
            <span
              className="grid h-[38px] w-[38px] place-items-center rounded-full border border-[var(--color-primary-muted)] bg-[rgba(242,182,61,.12)] text-[15px] font-black text-[var(--color-primary-bright)]"
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="hidden min-w-0 flex-col sm:flex">
              <strong className="max-w-[220px] overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                {displayName}
              </strong>
              <span className="text-xs tracking-[.12em] text-[var(--color-foreground-muted)]">@{username}</span>
            </div>
          </div>
          <form action={logoutAction}>
            <Button
              htmlType="submit"
              intent="secondary"
              className="h-10 px-3 text-xs font-extrabold uppercase sm:px-[18px]"
            >
              {t("Logout")}
            </Button>
          </form>
        </header>
        {children}
      </div>
    </main>
  );
}
