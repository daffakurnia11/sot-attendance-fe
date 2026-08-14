import { cva } from "class-variance-authority";

export const buttonVariants = cva("auth-button", {
  variants: {
    intent: {
      primary: "auth-button--primary",
      secondary: "auth-button--secondary",
    },
  },
  defaultVariants: { intent: "primary" },
});
