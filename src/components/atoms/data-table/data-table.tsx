"use client";

import { Children } from "react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib";

import { Panel } from "../panel";

type DataTableProps = Readonly<{
  action?: React.ReactNode;
  children: React.ReactNode;
  code: string;
  columns: Array<{ key?: string; label: string; className?: string }>;
  empty: string;
  footer?: React.ReactNode;
  summary?: React.ReactNode;
  title: string;
  toolbar?: React.ReactNode;
}>;

export function DataTable({ action, children, code, columns, empty, footer, summary, title, toolbar }: DataTableProps) {
  const hasRows = Children.count(children) > 0;
  const { translate } = useI18n();
  return (
    <Panel action={action} code={code} title={title} summary={summary} toolbar={toolbar} footer={footer}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] text-xs font-black tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
              {columns.map((column) => (
                <th className={cn("px-[18px] py-2.5", column.className)} key={column.key ?? column.label}>
                  {translate(column.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasRows ? (
              children
            ) : (
              <tr>
                <td
                  className="px-[18px] py-12 text-center text-[var(--color-foreground-muted)]"
                  colSpan={columns.length}
                >
                  {translate(empty)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function DataTableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-[18px] py-3 text-[var(--color-foreground-muted)]", className)}>{children}</td>;
}

export const dataTableRowClassName = "border-b border-[rgba(217,169,80,.12)] last:border-b-0";
