"use client";

import { useI18n } from "@/i18n";
import { cn } from "@/lib";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const nextLocale = locale === "en" ? "id" : "en";

  return (
    <button
      aria-label={t(nextLocale === "id" ? "Switch to Bahasa Indonesia" : "Switch to English")}
      className={cn(
        "grid h-10 min-w-10 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(242,182,61,.06)] px-2 text-xs font-black tracking-[.12em] text-[var(--color-primary-bright)] uppercase transition-colors hover:bg-[rgba(242,182,61,.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        className,
      )}
      onClick={() => setLocale(nextLocale)}
      title={t(nextLocale === "id" ? "Switch to Bahasa Indonesia" : "Switch to English")}
      type="button"
    >
      {locale.toUpperCase()}
    </button>
  );
}
