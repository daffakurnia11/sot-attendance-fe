type PageHeaderProps = Readonly<{
  description: string;
  eyebrow: string;
  title: string;
}>;

export function PageHeader({ description, eyebrow, title }: PageHeaderProps) {
  return (
    <header>
      <p className="text-xs font-black tracking-[.25em] text-[var(--color-primary)] uppercase">{eyebrow}</p>
      <h1 className="mt-2 mb-2.5 font-[Impact] text-[clamp(30px,3.5vw,44px)] leading-none font-normal tracking-[.02em] uppercase">{title}</h1>
      <p className="text-[var(--color-foreground-muted)]">{description}</p>
    </header>
  );
}
