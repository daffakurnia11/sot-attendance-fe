"use client";

import { Alert } from "antd";

import { useI18n } from "@/i18n";

type AuthFeedbackProps = {
  kind: "authentication" | "configuration" | "member-not-registered";
};

export function AuthFeedback({ kind }: AuthFeedbackProps) {
  const { t } = useI18n();
  const title =
    kind === "configuration"
      ? t("Discord authentication is not configured yet. Add both Discord credentials to the environment.")
      : kind === "member-not-registered"
        ? t("Your Discord account is not registered as an SOT member. Connect to the FiveM server once, then try again.")
        : t("Discord sign-in could not be completed. Please try again.");

  return (
    <Alert
      className="mb-5"
      showIcon
      title={title}
      type={kind === "configuration" ? "warning" : "error"}
    />
  );
}
