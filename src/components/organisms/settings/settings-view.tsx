"use client";

import { Alert, Input } from "antd";
import { useState } from "react";

import { Button } from "@/components/atoms";
import { useI18n } from "@/i18n";
import { memberProfileSchema } from "@/services/member-profile";
import type { SettingsData } from "@/services/settings";
import { formatIDRInput, normalizeCurrencyInput, settingsSchema, settingsValuesSchema } from "@/services/settings";

type Props = Readonly<{ initialCharacterName: string; initialCFXName: string; initialData: SettingsData | null }>;

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

export function SettingsView({ initialCharacterName, initialCFXName, initialData }: Props) {
  const [values, setValues] = useState<SettingsData | null>(initialData);
  const [characterName, setCharacterName] = useState(initialCharacterName);
  const [cfxName, setCFXName] = useState(initialCFXName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [moneyFeedback, setMoneyFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { t, translate } = useI18n();

  if (!values) return <Alert className="mt-7" type="error" showIcon title={t("Settings could not be loaded.")} />;

  async function saveProfile() {
    const parsed = memberProfileSchema.safeParse({ character_name: characterName, cfx_name: cfxName });
    if (!parsed.success) {
      setProfileFeedback({ type: "error", message: t("Character name must contain 1 to 80 characters.") });
      return;
    }
    setProfileSaving(true);
    setProfileFeedback(null);
    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : t("Profile could not be saved."),
        );
      const updated = memberProfileSchema.parse(payload);
      setCharacterName(updated.character_name);
      setCFXName(updated.cfx_name);
      setProfileFeedback({ type: "success", message: t("Profile saved.") });
    } catch (error) {
      setProfileFeedback({
        type: "error",
        message: translate(error instanceof Error ? error.message : t("Profile could not be saved.")),
      });
    } finally {
      setProfileSaving(false);
    }
  }

  async function save(section: "attendance" | "money" = "attendance") {
    const setSectionFeedback = section === "money" ? setMoneyFeedback : setFeedback;
    const parsed = settingsValuesSchema.safeParse(values);
    if (!parsed.success || parsed.data.start_attendance === parsed.data.end_attendance) {
      setSectionFeedback({ type: "error", message: t("Use valid times, duration, counts, and attendance day range (1–31).") });
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
    <div className="mt-7 grid gap-6">
      <section className="border border-[var(--color-border)] bg-[rgba(242,182,61,.025)]">
        <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
          <h2 className="font-[Impact] text-2xl font-normal uppercase">{t("My profile")}</h2>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{t("Settings for authenticated member.")}</p>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          <label className="grid gap-2">
            <span className="text-xs font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
              {t("Character name")}
            </span>
            <Input
              className="h-11 border-[var(--color-border)] bg-[rgba(7,6,5,.7)] px-3 text-base"
              maxLength={80}
              value={characterName}
              onChange={(event) => setCharacterName(event.target.value)}
            />
            <span className="text-xs text-[var(--color-foreground-muted)]">
              {t("Name shown in attendance recap and player records.")}
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
              {t("CFX name")}
            </span>
            <Input
              className="h-11 border-[var(--color-border)] bg-[rgba(7,6,5,.7)] px-3 text-base"
              maxLength={80}
              value={cfxName}
              onChange={(event) => setCFXName(event.target.value)}
            />
            <span className="text-xs text-[var(--color-foreground-muted)]">
              {t("Player name used on CFX server. Leave blank when not registered.")}
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div aria-live="polite">
            {profileFeedback ? <Alert type={profileFeedback.type} showIcon title={profileFeedback.message} /> : null}
          </div>
          <Button
            loading={profileSaving}
            disabled={profileSaving}
            onClick={saveProfile}
            className="h-11 px-6 font-extrabold uppercase"
          >
            {t("Save profile")}
          </Button>
        </div>
      </section>
      <section className="border border-[var(--color-border)] bg-[rgba(242,182,61,.025)]">
        <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
          <h2 className="font-[Impact] text-2xl font-normal uppercase">{t("Attendance settings")}</h2>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            {values.is_admin
              ? t("Values stored in settings table.")
              : t("Read-only. Administrator role required to edit.")}
          </p>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          {fields.map((field) => (
            <label className="grid gap-2" key={field.key}>
              <span className="text-xs font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
                {translate(field.label)}
              </span>
              <Input
                className="h-11 border-[var(--color-border)] bg-[rgba(7,6,5,.7)] px-3 text-base"
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
              <span className="text-xs text-[var(--color-foreground-muted)]">{translate(field.help)}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
        </div>
      </section>
      <section className="border border-[var(--color-border)] bg-[rgba(242,182,61,.025)]">
        <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
          <h2 className="font-[Impact] text-2xl font-normal uppercase">{t("Money settings")}</h2>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            {t("Current office and dirty money balances.")}
          </p>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          <label className="grid gap-2">
            <span className="text-xs font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
              {t("Office money")}
            </span>
            <Input
              aria-label={t("Current office money balance")}
              className="h-11 border-[var(--color-border)] bg-[rgba(7,6,5,.7)] px-3 text-base"
              disabled={!values.is_admin}
              inputMode="numeric"
              prefix="$"
              value={formatIDRInput(values.office_money_balance)}
              onChange={(event) =>
                setValues((current) =>
                  current ? { ...current, office_money_balance: normalizeCurrencyInput(event.target.value) } : current,
                )
              }
            />
            <span className="text-xs text-[var(--color-foreground-muted)]">
              {values.is_admin
                ? t("Administrator may correct current office balance.")
                : t("Read-only. Administrator role required to edit.")}
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
              {t("Dirty money")}
            </span>
            <Input
              aria-label={t("Current dirty money balance")}
              className="h-11 border-[var(--color-border)] bg-[rgba(7,6,5,.7)] px-3 text-base"
              disabled={!values.is_admin}
              inputMode="numeric"
              prefix="$"
              value={formatIDRInput(values.dirty_money_balance)}
              onChange={(event) =>
                setValues((current) =>
                  current ? { ...current, dirty_money_balance: normalizeCurrencyInput(event.target.value) } : current,
                )
              }
            />
            <span className="text-xs text-[var(--color-foreground-muted)]">
              {values.is_admin
                ? t("Administrator may correct current dirty money balance.")
                : t("Read-only. Administrator role required to edit.")}
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
        </div>
      </section>
    </div>
  );
}
