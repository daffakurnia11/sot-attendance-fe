"use client";

import { Alert } from "antd";

import { content } from "@/data";

type AuthFeedbackProps = {
  kind: "authentication" | "configuration" | "member-not-registered";
};

export function AuthFeedback({ kind }: AuthFeedbackProps) {
  const title =
    kind === "configuration"
      ? content.auth.configurationError
      : kind === "member-not-registered"
        ? content.auth.memberNotRegisteredError
        : content.auth.authError;

  return (
    <Alert
      className="mb-5"
      showIcon
      title={title}
      type={kind === "configuration" ? "warning" : "error"}
    />
  );
}
