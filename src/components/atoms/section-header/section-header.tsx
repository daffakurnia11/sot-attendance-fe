type SectionHeaderProps = Readonly<{
  eyebrow: string;
  index: string;
  title: string;
}>;

export function SectionHeader({ eyebrow, index, title }: SectionHeaderProps) {
  return (
    <div className="grid grid-cols-[34px_1fr] items-center gap-3 sm:grid-cols-[38px_auto_1fr]">
      <span className="grid h-[34px] w-[34px] place-items-center border border-[var(--color-border)] bg-[rgba(242,182,61,.07)] text-xs font-black text-[var(--color-primary)] sm:h-[38px] sm:w-[38px]">{index}</span>
      <div className="flex flex-col items-start gap-px sm:flex-row sm:items-baseline sm:gap-3">
        <p className="text-xs font-black tracking-[.25em] text-[var(--color-primary)] uppercase">{eyebrow}</p>
        <h2 className="font-[Impact] text-[27px] font-normal tracking-[.03em] uppercase">{title}</h2>
      </div>
      <i className="hidden h-px bg-[linear-gradient(90deg,var(--color-border),transparent)] sm:block" aria-hidden="true" />
    </div>
  );
}
