import { cva } from "class-variance-authority";

export const typographyVariants = cva("", {
  variants: {
    variant: {
      display: "display-type font-black uppercase tracking-[-0.055em] text-[var(--color-foreground)]",
      heading: "display-type font-black uppercase tracking-[-0.03em] text-[var(--color-foreground)]",
      eyebrow: "font-black uppercase tracking-[0.22em] text-[var(--color-primary)]",
      body: "leading-7 text-[var(--color-foreground-muted)]",
      caption: "leading-5 text-[var(--color-foreground-muted)]",
    },
  },
  defaultVariants: { variant: "body" },
});
