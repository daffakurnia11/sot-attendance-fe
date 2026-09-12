"use client";

import { Alert, Input } from "antd";
import { useState } from "react";

import { Button, Field, FormSection, PanelTabs, ResourceState } from "@/components/atoms";
import { useI18n } from "@/i18n";
import type { SafeboxStock } from "@/services/safebox-stock";
import type { SettingsData } from "@/services/settings";
import { formatIDRInput, normalizeCurrencyInput, settingsSchema, settingsValuesSchema } from "@/services/settings";

import { SafeboxStockSettings } from "./safebox-stock-settings";

type Props = Readonly<{ initialData: SettingsData | null; safeboxStock: SafeboxStock | null }>;

const fields = [
  {
    key: "start_attendance",
    label: "Attendance starts",
    help: "Daily start in Asia/Jakarta time.",
    placeholder: "21:00",
  },
  {
    key: "end_attendance",
    label: "Attendance ends",
    help: "Daily end; overnight ranges supported.",
    placeholder: "01:00",
  },
  {
    key: "playtime_threshold",
    label: "Required playtime",
    help: "Positive Go duration, e.g. 90m or 1h30m.",
    placeholder: "90m",
  },
  {
    key: "player_threshold",
    label: "Player capacity",
    help: "Maximum player count shown in dashboard ratio.",
    placeholder: "15",
  },
  {
    key: "attendance_minimum",
    label: "Minimum attendance",
    help: "Minimum attendance days counted in one month.",
    placeholder: "24",
  },
  {
    key: "attendance_maximum",
    label: "Maximum attendance",
    help: "Maximum attendance days counted in one month.",
    placeholder: "30",
  },
  {
    key: "start_date_contract",
    label: "Contract start date",
    help: "Day of month when each attendance and payslip period starts.",
    placeholder: "28",
  },
  {
    key: "payment_contract",
    label: "Payment contract",
    help: "Contract value in Indonesian rupiah, stored as whole number.",
    placeholder: "8000000",
  },
] as const;

export function SettingsView({ initialData, safeboxStock }: Props) {
  const [values, setValues] = useState<SettingsData | null>(initialData);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [moneyFeedback, setMoneyFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { t, translate } = useI18n();

  if (!values) return <ResourceState state="unavailable" message={t("Settings could not be loaded.")} />;

  async function save(section: "attendance" | "money" = "attendance") {
    const setSectionFeedback = section === "money" ? setMoneyFeedback : setFeedback;
    const parsed = settingsValuesSchema.safeParse(values);
    if (!parsed.success || parsed.data.start_attendance === parsed.data.end_attendance) {
      setSectionFeedback({
        type: "error",
        message: t("Use valid times, duration, counts, and attendance day range (1–31)."),
      });
      return;
    }
    setSaving(true);
    setSectionFeedback(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : t("Settings could not be saved."),
        );
      const updated = settingsSchema.parse(payload);
      setValues(updated);
      setSectionFeedback({
        type: "success",
        message: section === "money" ? t("Money settings saved.") : t("Settings saved."),
      });
    } catch (error) {
      setSectionFeedback({
        type: "error",
        message: translate(error instanceof Error ? error.message : t("Settings could not be saved.")),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PanelTabs
      label="Settings sections"
      items={[
        {
          key: "attendance",
          label: "Attendance settings",
          children: (
            <FormSection
              title={<>{t("Attendance settings")}</>}
              description={
                <>
                  {values.is_admin
                    ? t("Values stored in settings table.")
                    : t("Read-only. Administrator role required to edit.")}
                </>
              }
              footer={
                <>
                  <div aria-live="polite">
                    {feedback ? <Alert type={feedback.type} showIcon title={feedback.message} /> : null}
                  </div>
                  <Button
                    loading={saving}
                    disabled={saving || !values.is_admin}
                    onClick={() => save("attendance")}
                    className="h-11 px-6 font-extrabold uppercase"
                  >
                    {values.is_admin ? t("Save settings") : t("Admin required")}
                  </Button>
                </>
              }
            >
              {fields.map((field) => (
                <Field key={field.key} label={<>{translate(field.label)}</>} help={<>{translate(field.help)}</>}>
                  <Input
                    className="h-11 border-[var(--color-border)] bg-[var(--color-control-background)] px-3 text-base"
                    disabled={!values.is_admin}
                    inputMode={
                      ["payment_contract", "attendance_minimum", "attendance_maximum", "start_date_contract"].includes(
                        field.key,
                      )
                        ? "numeric"
                        : undefined
                    }
                    prefix={field.key === "payment_contract" ? "Rp." : undefined}
                    suffix={
                      ["attendance_minimum", "attendance_maximum"].includes(field.key)
                        ? t("days/month")
                        : field.key === "start_date_contract"
                          ? t("day of month")
                          : undefined
                    }
                    value={field.key === "payment_contract" ? formatIDRInput(values[field.key]) : values[field.key]}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setValues((current) =>
                        current
                          ? {
                              ...current,
                              [field.key]:
                                field.key === "payment_contract"
                                  ? normalizeCurrencyInput(event.target.value)
                                  : event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </Field>
              ))}
            </FormSection>
          ),
        },
        {
          key: "money",
          label: "Money settings",
          children: (
            <FormSection
              title={<>{t("Money settings")}</>}
              description={<>{t("Current office and dirty money balances.")}</>}
              footer={
                <>
                  <div aria-live="polite">
                    {moneyFeedback ? <Alert type={moneyFeedback.type} showIcon title={moneyFeedback.message} /> : null}
                  </div>
                  <Button
                    loading={saving}
                    disabled={saving || !values.is_admin}
                    onClick={() => save("money")}
                    className="h-11 px-6 font-extrabold uppercase"
                  >
                    {values.is_admin ? t("Save money") : t("Admin required")}
                  </Button>
                </>
              }
            >
              <Field
                label={<>{t("Office money")}</>}
                help={
                  <>
                    {values.is_admin
                      ? t("Administrator may correct current office balance.")
                      : t("Read-only. Administrator role required to edit.")}
                  </>
                }
              >
                <Input
                  aria-label={t("Current office money balance")}
                  className="h-11 border-[var(--color-border)] bg-[var(--color-control-background)] px-3 text-base"
                  disabled={!values.is_admin}
                  inputMode="numeric"
                  prefix="$"
                  value={formatIDRInput(values.office_money_balance)}
                  onChange={(event) =>
                    setValues((current) =>
                      current
                        ? { ...current, office_money_balance: normalizeCurrencyInput(event.target.value) }
                        : current,
                    )
                  }
                />
              </Field>
              <Field
                label={<>{t("Dirty money")}</>}
                help={
                  <>
                    {values.is_admin
                      ? t("Administrator may correct current dirty money balance.")
                      : t("Read-only. Administrator role required to edit.")}
                  </>
                }
              >
                <Input
                  aria-label={t("Current dirty money balance")}
                  className="h-11 border-[var(--color-border)] bg-[var(--color-control-background)] px-3 text-base"
                  disabled={!values.is_admin}
                  inputMode="numeric"
                  prefix="$"
                  value={formatIDRInput(values.dirty_money_balance)}
                  onChange={(event) =>
                    setValues((current) =>
                      current
                        ? { ...current, dirty_money_balance: normalizeCurrencyInput(event.target.value) }
                        : current,
                    )
                  }
                />
              </Field>
            </FormSection>
          ),
        },
        {
          key: "safebox-stock",
          label: "Safebox stock settings",
          children: <SafeboxStockSettings initialData={safeboxStock} isAdmin={values.is_admin} />,
        },
      ]}
    />
  );
}
