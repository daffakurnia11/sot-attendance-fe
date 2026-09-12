"use client";

import { useState } from "react";

import { ItemQuantityCard, ResourceState, type Safebox, SafeboxToggle } from "@/components/atoms";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { fetchSafeboxStockRoute, type SafeboxStock, stockGroups } from "@/services/safebox-stock";

type Props = Readonly<{ initialData: SafeboxStock | null }>;

export function SafeboxStockView({ initialData }: Props) {
  const { t, translate } = useI18n();
  const [box, setBox] = useState<Safebox>("public");
  const { data, failed, stale, retry, isLoading } = useLiveResource({
    initialData,
    path: "/api/safebox-stock",
    fetcher: fetchSafeboxStockRoute,
  });
  const currentItems = (data?.items ?? []).filter((item) => item.safebox === box);

  if (!data)
    return (
      <ResourceState
        state={isLoading ? "loading" : "unavailable"}
        message={isLoading ? "Loading data..." : "Safebox stock could not be loaded."}
        onRetry={() => void retry()}
      />
    );
  return (
    <>
      {failed || stale ? (
        <ResourceState
          state="stale"
          message={stale ? "Live updates stopped. Sign in again to resume." : "Safebox stock could not be refreshed."}
          onRetry={() => void retry()}
        />
      ) : null}

      <div className="mt-5 min-w-0 border border-[var(--color-border)]">
        <div className="flex justify-end border-b border-[var(--color-border)] p-3">
          <SafeboxToggle onChange={setBox} value={box} />
        </div>

        {!currentItems.length ? <ResourceState state="empty" message="No stock items configured." /> : null}
        {stockGroups
          .filter((group) => currentItems.some((item) => item.stock_group === group.key))
          .map((group) => {
            const groupedItems = currentItems.filter((item) => item.stock_group === group.key);
            return (
              <section className="bg-[rgba(13,10,6,.72)]" key={group.key}>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                      {translate(group.label)}
                    </p>
                    <h2 className="mt-0.5 font-display text-2xl font-normal uppercase">{translate("Stock items")}</h2>
                  </div>
                  <span className="text-[10px] font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
                    {t("{count} items", { count: groupedItems.length })}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 border-b border-[var(--color-border)] p-3 sm:grid-cols-2 xl:grid-cols-4">
                  {groupedItems.map((item, index) => (
                    <ItemQuantityCard
                      key={item.item_key}
                      index={index + 1}
                      name={item.name}
                      quantity={item.quantity}
                      note={box === "public" ? "Public Safebox" : "Boss Safebox"}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </>
  );
}
