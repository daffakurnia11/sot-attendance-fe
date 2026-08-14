"use client";

import { DiscordOutlined, LogoutOutlined } from "@ant-design/icons";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/atoms";
import { content } from "@/data";

type AuthSubmitButtonProps = {
  disabled?: boolean;
  mode?: "sign-in" | "sign-out";
};

export function AuthSubmitButton({ disabled = false, mode = "sign-in" }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const signingOut = mode === "sign-out";

  const label = pending
    ? signingOut
      ? content.auth.signingOut
      : content.auth.signingIn
    : signingOut
      ? content.auth.signOut
      : content.auth.signIn;

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
