"use client";

import { Select } from "antd";

import { cn } from "@/lib";

export type OptionDropdownOption = Readonly<{
  label: string;
  value: string;
}>;

type OptionDropdownProps = Readonly<{
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  options: readonly OptionDropdownOption[];
  value: string;
}>;

export function OptionDropdown({ ariaLabel, className, onChange, options, value }: OptionDropdownProps) {
  return (
    <Select
      aria-label={ariaLabel}
      className={cn("h-9 min-w-[132px] [&_.ant-select-selector]:!px-3", className)}
      classNames={{
        content: "!text-xs !font-bold !tracking-[.08em] !uppercase",
        popup: {
          list: "!p-1.5",
          listItem: "!min-h-9 !px-3 !py-2 !text-xs !font-bold !tracking-[.06em] !uppercase",
          root: "!border !border-[var(--color-border)]",
        },
      }}
      onChange={onChange}
      options={[...options]}
      popupMatchSelectWidth={false}
      value={value}
    />
  );
}
