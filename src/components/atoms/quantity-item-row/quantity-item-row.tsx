"use client";
import { InputNumber, Select } from "antd";

import { useI18n } from "@/i18n";
export function QuantityItemRow({
  label,
  value,
  quantity,
  options,
  onItemChange,
  onQuantityChange,
  onRemove,
  removeDisabled,
  disabled = false,
}: Readonly<{
  label: string;
  value: string;
  quantity: number;
  options: readonly { label: string; value: string; disabled?: boolean }[];
  onItemChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onRemove: () => void;
  removeDisabled: boolean;
  disabled?: boolean;
}>) {
  const { t } = useI18n();
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_76px_36px] items-end gap-2 border border-[var(--color-border)] bg-[var(--color-control-background)] p-2">
      <label className="grid min-w-0 gap-1">
        <span className="text-xs font-extrabold tracking-[.12em] text-[var(--color-primary-muted)] uppercase">
          {label}
        </span>
        <Select
          aria-label={label}
          className="h-9 min-w-0 w-full"
          value={value || undefined}
          options={[...options]}
          onChange={onItemChange}
          placeholder={t("Item")}
          showSearch
          optionFilterProp="label"
          disabled={disabled}
        />
      </label>
      <label className="grid min-w-0 gap-1">
        <span className="text-xs font-extrabold tracking-[.12em] text-[var(--color-primary-muted)] uppercase">
          {t("Qty")}
        </span>
        <InputNumber
          aria-label={t("Quantity for {item}", { item: label })}
          className="h-9 w-full"
          min={1}
          max={10_000}
          precision={0}
          value={quantity}
          onChange={(value) => onQuantityChange(value ?? 1)}
          disabled={disabled}
        />
      </label>
      <button
        aria-label={t("Remove {item}", { item: label })}
        className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-lg text-[var(--color-foreground-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-30"
        disabled={disabled || removeDisabled}
        onClick={onRemove}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
