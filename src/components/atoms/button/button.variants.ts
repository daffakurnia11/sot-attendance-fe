import { cva } from "class-variance-authority";

export const buttonVariants = cva("transition-[transform,box-shadow,background] duration-150", {
  variants: {
    intent: {
      primary: "!border-[#ffc858] !bg-[linear-gradient(135deg,#f8cf66_0%,#dc9527_100%)] !text-[#1a1004] tracking-[.06em] uppercase hover:!-translate-y-px hover:!border-[var(--color-primary-bright)] hover:!bg-[linear-gradient(135deg,#ffe18a_0%,#eba83a_100%)] hover:!text-[#130b02] focus-visible:!-translate-y-px focus-visible:!border-[var(--color-primary-bright)] focus-visible:!bg-[linear-gradient(135deg,#ffe18a_0%,#eba83a_100%)] focus-visible:!text-[#130b02]",
      secondary: "!border-[var(--color-border)] !bg-[rgba(255,255,255,.025)] !text-[var(--color-foreground)]",
    },
  },
  defaultVariants: { intent: "primary" },
});
