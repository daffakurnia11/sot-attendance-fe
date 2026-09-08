"use client";
import { Modal, Tabs } from "antd";
import type { ReactNode } from "react";

import { StatusIndicator, type StatusTone } from "../status-indicator";
export function AttendanceDetailDialog({
  title,
  summary,
  onClose,
  groups,
}: Readonly<{
  title: string;
  summary: ReactNode;
  onClose: () => void;
  groups: readonly { key: string; label: string; tone: StatusTone; count: number; children: ReactNode }[];
}>) {
  return (
    <Modal centered footer={null} onCancel={onClose} open title={title} width={640}>
      <p className="text-sm text-[var(--color-foreground-muted)]">{summary}</p>
      <Tabs
        defaultActiveKey="attended"
        items={groups.map((group) => ({
          key: group.key,
          label: (
            <span className="flex items-center gap-2">
              <StatusIndicator tone={group.tone}>{group.label}</StatusIndicator>
              <span className="text-xs text-[var(--color-foreground-muted)]">{group.count}</span>
            </span>
          ),
          children: group.children,
        }))}
      />
    </Modal>
  );
}
