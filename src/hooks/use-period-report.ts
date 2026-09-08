"use client";
import { useEffect, useRef, useState } from "react";

import { fetchPeriodReport, shiftMonth } from "@/lib/report-period";
export function usePeriodReport<T extends { month: string }>({
  initialData,
  endpoint,
  schema,
}: Readonly<{ initialData: T | null; endpoint: string; schema: { parse: (value: unknown) => T } }>) {
  const [report, setReport] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(!initialData);
  const requestedMonth = useRef<string | undefined>(initialData?.month);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function load(month?: string) {
    requestedMonth.current = month;
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setLoading(true);
    setError(false);
    try {
      const data = await fetchPeriodReport(endpoint, month, schema, next.signal);
      if (controller.current === next && !next.signal.aborted) setReport(data);
    } catch {
      if (controller.current === next && !next.signal.aborted) setError(true);
    } finally {
      if (controller.current === next && !next.signal.aborted) setLoading(false);
    }
  }
  return {
    report,
    loading,
    error,
    changeMonth: (offset: number) => load(report ? shiftMonth(report.month, offset) : undefined),
    retry: () => load(requestedMonth.current),
  };
}
