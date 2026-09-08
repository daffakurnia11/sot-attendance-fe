"use client";

import { useI18n } from "@/i18n";

import { MetricCard } from "../metric-card";

export type StatisticCardProps = Readonly<{ index: number; label: string; note?: string; value: string }>;

export function StatisticCard({ index, label, note = "Personal attendance record", value }: StatisticCardProps) {
  const { translate } = useI18n();
  return <MetricCard variant="decorated" index={index} label={translate(label)} note={translate(note)} value={value} />;
}
