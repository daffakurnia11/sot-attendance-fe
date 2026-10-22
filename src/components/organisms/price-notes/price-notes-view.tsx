"use client";
import { ResourceState, RouteTabs } from "@/components/atoms";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { fetchPriceNotesRoute, type PriceNotes } from "@/services/price-notes";
import { stockGroups } from "@/services/safebox-stock";

import { InternalPrices } from "./internal-prices";

export function PriceNotesView({
  initialData,
  direction = "purchase",
}: {
  initialData: PriceNotes | null;
  direction?: "purchase" | "sale" | "internal";
}) {
  const { translate } = useI18n();
  const { data, isLoading, stale, failed, retry } = useLiveResource({
    initialData,
    path: "/api/price-notes",
    fetcher: fetchPriceNotesRoute,
  });
  const entries = data?.items.filter((item) => item.direction === direction) ?? [];
  const groups = new Map<string, typeof entries>();
  for (const item of entries) {
    const key = direction === "purchase" ? (item.stock_group ?? "other") : item.partner_code;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  const weaponOrder = ["Desert Eagle", "Revolver MK2", "MP9", "Vector", "CRX MK2"];
  const rank = (name: string) => {
    const index = weaponOrder.indexOf(name);
    return index < 0 ? weaponOrder.length : index;
  };
  const groupKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));
  return (
    <>
      <RouteTabs
        label="Price direction"
        active={direction}
        items={[
          { key: "purchase", label: "Partners to SOT", href: `${routes.priceNotes}?direction=purchase` },
          { key: "sale", label: "SOT to Partners", href: `${routes.priceNotes}?direction=sale` },
          { key: "internal", label: "SOT Internal", href: `${routes.priceNotes}?direction=internal` },
        ]}
      />
      <div className="mt-[var(--space-section)] space-y-6">
        {!data ? (
          <ResourceState
            state={isLoading ? "loading" : "unavailable"}
            message={isLoading ? "Loading data..." : "Price notes could not be loaded."}
            onRetry={() => void retry()}
          />
        ) : (
          <>
            {stale || failed ? (
              <ResourceState state="stale" message="Price notes could not be refreshed." onRetry={() => void retry()} />
            ) : null}
            {direction === "internal" ? (
              <InternalPrices items={entries} />
            ) : groupKeys.length === 0 ? (
              <ResourceState state="empty" message="No price notes recorded." />
            ) : (
              groupKeys.map((key) => {
                const items = [...groups.get(key)!].sort((a, b) =>
                  direction === "sale"
                    ? rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)
                    : a.name.localeCompare(b.name) ||
                      a.partner_code.localeCompare(b.partner_code) ||
                      a.unit.localeCompare(b.unit),
                );
                const code = items[0].partner_code;
                return (
                  <section key={key} className="border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-5">
                    <h2 className="font-display text-2xl uppercase">
                      {direction === "purchase"
                        ? translate(
                            stockGroups.find((group) => group.key === key)?.label.replace(/ Stock$/, "") ?? "Other",
                          )
                        : items[0].partner_name === code
                          ? code
                          : `${items[0].partner_name} · ${code}`}
                    </h2>
                    <ul
                      className={`mt-4 grid gap-3 sm:grid-cols-2 ${direction === "sale" ? "xl:grid-cols-5" : "xl:grid-cols-3"}`}
                    >
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className={`min-w-0 border border-[var(--color-border)] ${direction === "sale" ? "flex flex-col p-4" : "p-3"}`}
                        >
                          <div
                            className={
                              direction === "sale" ? "flex flex-col gap-3" : "flex flex-wrap justify-between gap-2"
                            }
                          >
                            <strong>
                              {direction === "purchase"
                                ? item.partner_name === item.partner_code
                                  ? item.partner_code
                                  : `${item.partner_name} · ${item.partner_code}`
                                : item.name}
                            </strong>
                            <span
                              className={`font-bold text-[var(--color-primary)] ${direction === "sale" ? "text-xl leading-tight" : ""}`}
                            >
                              $ {new Intl.NumberFormat("id-ID").format(item.price)} / {item.unit}
                            </span>
                          </div>
                          {direction === "purchase" ? <p className="mt-2 text-sm">{item.name}</p> : null}
                          {item.notes ? (
                            <p
                              className={`${direction === "sale" ? "mt-4 border-t border-[var(--color-border)] pt-3" : "mt-2"} whitespace-pre-wrap text-sm text-[var(--color-foreground-muted)] [overflow-wrap:anywhere]`}
                            >
                              {item.notes}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })
            )}
          </>
        )}
      </div>
    </>
  );
}
