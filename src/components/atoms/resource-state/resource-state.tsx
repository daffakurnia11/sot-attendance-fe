"use client";
import { Alert } from "antd";

import { useI18n } from "@/i18n";

import { Button } from "../button";
export function ResourceState({
  state,
  message,
  onRetry,
}: Readonly<{ state: "loading" | "unavailable" | "stale" | "empty"; message: string; onRetry?: () => void }>) {
  const { t, translate } = useI18n();
  if (state === "empty")
    return (
      <p role="status" className="px-4 py-10 text-center text-sm text-[var(--color-foreground-muted)]">
        {translate(message)}
      </p>
    );
  return (
    <div className="mt-6" aria-live="polite" aria-busy={state === "loading"}>
      <Alert
        showIcon
        type={state === "unavailable" ? "error" : state === "stale" ? "warning" : "info"}
        title={translate(message)}
        action={
          state !== "loading" ? (
            <Button intent="secondary" size="small" onClick={onRetry ?? (() => window.location.reload())}>
              {t("Retry")}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
