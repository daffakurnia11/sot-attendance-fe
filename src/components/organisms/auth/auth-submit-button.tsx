"use client";

import { DiscordOutlined, LogoutOutlined } from "@ant-design/icons";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/atoms";
import { useI18n } from "@/i18n";

type AuthSubmitButtonProps = {
  disabled?: boolean;
  mode?: "sign-in" | "sign-out";
};

export function AuthSubmitButton({ disabled = false, mode = "sign-in" }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  const signingOut = mode === "sign-out";

  const label = pending
    ? signingOut
      ? t("Leaving...")
      : t("Opening Discord...")
    : signingOut
      ? t("Sign out")
      : t("Continue with Discord");

  return (
    <Button
      block
      disabled={disabled}
      htmlType="submit"
      icon={signingOut ? <LogoutOutlined /> : <DiscordOutlined />}
      intent={signingOut ? "secondary" : "primary"}
      loading={pending}
      size="large"
    >
      {label}
    </Button>
  );
}
