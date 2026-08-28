"use client";

import { FileExcelOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";

import { useI18n } from "@/i18n";
import type { ExportSheet } from "@/lib/report-export";
import { exportXlsx } from "@/lib/report-export";

type Props = Readonly<{
  filename: string;
  sheets: readonly ExportSheet[];
}>;

export function ReportExportButton({ filename, sheets }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { t } = useI18n();
  const label = failed ? t("Report export failed.") : busy ? t("Exporting...") : t("Export XLSX");

  async function run() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await exportXlsx(filename, sheets);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      aria-label={label}
      className={`grid h-8 w-8 shrink-0 place-items-center border transition-colors disabled:opacity-45 ${
        failed
          ? "border-[#ef7474] text-[#ef7474]"
          : "border-[var(--color-border)] text-[var(--color-primary-bright)] hover:bg-[rgba(242,182,61,.1)]"
      }`}
      disabled={busy}
      onClick={() => void run()}
      title={label}
      type="button"
    >
      {busy ? <LoadingOutlined spin /> : <FileExcelOutlined />}
    </button>
  );
}
