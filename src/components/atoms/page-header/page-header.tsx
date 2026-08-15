"use client";

import { useEffect } from "react";

import { useI18n } from "@/i18n";

type PageHeaderProps = Readonly<{
  description: string;
  eyebrow: string;
  title: string;
}>;

export function PageHeader({ description, eyebrow, title }: PageHeaderProps) {
  const { translate } = useI18n();
  const localizedTitle = translate(title);
  useEffect(() => { document.title = `${localizedTitle} | SOT Attendance`; }, [localizedTitle]);
  return (
    <header>
      <p className="text-xs font-black tracking-[.25em] text-[var(--color-primary)] uppercase">{translate(eyebrow)}</p>
      <h1 className="mt-2 mb-2.5 font-[Impact] text-[clamp(30px,3.5vw,44px)] leading-none font-normal tracking-[.02em] uppercase">{localizedTitle}</h1>
      <p className="text-[var(--color-foreground-muted)]">{translate(description)}</p>
    </header>
  );
}
