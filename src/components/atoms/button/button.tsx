"use client";

import type { ButtonProps as AntButtonProps } from "antd";
import { Button as AntButton } from "antd";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib";

import { buttonVariants } from "./button.variants";

export type ButtonProps = AntButtonProps & VariantProps<typeof buttonVariants>;

export function Button({ className, intent, ...props }: ButtonProps) {
  return (
    <AntButton
      className={cn(buttonVariants({ intent }), className)}
      type={intent === "secondary" ? "default" : "primary"}
      {...props}
    />
  );
}
