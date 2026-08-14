import type { VariantProps } from "class-variance-authority";
import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib";

import { typographyVariants } from "./typography.variants";

type TypographyProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: ElementType;
  };

export function Typography({ as: Component = "p", className, variant, ...props }: TypographyProps) {
  return <Component className={cn(typographyVariants({ variant }), className)} {...props} />;
}
