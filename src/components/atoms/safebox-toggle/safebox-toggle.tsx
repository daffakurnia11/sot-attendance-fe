"use client";
import { useI18n } from "@/i18n";
import { cn } from "@/lib";

export type Safebox = "public" | "boss";

/** Segmented control choosing which shared safebox a view is showing. */
export function SafeboxToggle({
  value,
  onChange,
  className,
  disabled = false,
}: Readonly<{ value: Safebox; onChange: (value: Safebox) => void; className?: string; disabled?: boolean }>) {
  const { t } = useI18n();
  return (
    <div
      aria-label={t("Safebox selection")}
      className={cn("flex border border-[var(--color-border)] p-1", className)}
      role="group"
    >
      {(["public", "boss"] as Safebox[]).map((box) => (
        <button
          aria-pressed={value === box}
          className={cn(
            "flex-1 px-4 py-2 text-xs font-extrabold tracking-[.12em] whitespace-nowrap text-[var(--color-foreground-muted)] uppercase",
            value === box && "bg-[var(--color-primary)] text-[#160f05]",
          )}
          disabled={disabled}
          key={box}
          onClick={() => onChange(box)}
          type="button"
        >
          {box === "public" ? t("Public Safebox") : t("Boss Safebox")}
        </button>
      ))}
    </div>
  );
}
