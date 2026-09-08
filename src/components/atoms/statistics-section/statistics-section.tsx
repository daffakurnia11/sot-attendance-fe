import { SectionHeader } from "../section-header";
import { StatisticCard, type StatisticCardProps } from "../statistic-card";
export function StatisticsSection({
  index,
  title,
  items,
}: Readonly<{ index: string; title: string; items: readonly Omit<StatisticCardProps, "index">[] }>) {
  return (
    <section className="mt-[var(--space-section)]">
      <SectionHeader index={index} eyebrow="Overview" title={title} />
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((item, i) => (
          <StatisticCard key={item.label} index={i + 1} {...item} />
        ))}
      </div>
    </section>
  );
}
