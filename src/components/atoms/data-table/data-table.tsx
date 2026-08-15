import { Children } from "react";

import { cn } from "@/lib";

type DataTableProps = Readonly<{
  children: React.ReactNode;
  code: string;
  columns: Array<{ label: string; className?: string }>;
  empty: string;
  footer?: React.ReactNode;
  summary?: React.ReactNode;
  title: string;
  toolbar?: React.ReactNode;
}>;

export function DataTable({ children, code, columns, empty, footer, summary, title, toolbar }: DataTableProps) {
  const hasRows = Children.count(children) > 0;
  return (
    <section className="overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(242,182,61,.055),rgba(255,255,255,.01))] shadow-[inset_0_3px_0_rgba(242,182,61,.2)]">
      <header className="flex min-h-[52px] flex-col items-start justify-between gap-2 border-b border-[var(--color-border)] px-[18px] py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-[11px] uppercase"><span className="grid h-[30px] w-[30px] shrink-0 place-items-center border border-[var(--color-border)] text-xs font-black text-[var(--color-primary)]">{code}</span><h2 className="whitespace-nowrap font-[Impact] text-[22px] font-normal tracking-[.04em] uppercase">{title}</h2></div>
        {summary ? <span className="whitespace-nowrap text-xs font-black tracking-[.14em] text-[var(--color-primary)] uppercase sm:text-right">{summary}</span> : null}
      </header>
      {toolbar ? <div className="border-b border-[rgba(217,169,80,.14)] px-[18px] py-2.5">{toolbar}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead><tr className="border-b border-[rgba(217,169,80,.14)] text-xs font-black tracking-[.14em] text-[var(--color-primary-muted)] uppercase">{columns.map((column) => <th className={cn("px-[18px] py-2.5", column.className)} key={column.label}>{column.label}</th>)}</tr></thead>
          <tbody>{hasRows ? children : <tr><td className="px-[18px] py-12 text-center text-[var(--color-foreground-muted)]" colSpan={columns.length}>{empty}</td></tr>}</tbody>
        </table>
      </div>
      {footer ? <footer className="border-t border-[rgba(217,169,80,.14)]">{footer}</footer> : null}
    </section>
  );
}

export function DataTableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-[18px] py-3 text-[var(--color-foreground-muted)]", className)}>{children}</td>;
}

export const dataTableRowClassName = "border-b border-[rgba(217,169,80,.12)] last:border-b-0";
