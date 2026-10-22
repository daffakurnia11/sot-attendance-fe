"use client";
import Link from "next/link";

import { ResourceState, RouteTabs } from "@/components/atoms";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { createRouteFetcher } from "@/lib/route-fetcher";
import { type OrderLog, orderLogSchema } from "@/services/order-log";

export function OrderLogView({
  initialData,
  before = "",
  kind = "",
}: {
  initialData: OrderLog | null;
  before?: string;
  kind?: string;
}) {
  const { translate } = useI18n();
  const query = new URLSearchParams();
  if (before) query.set("before", before);
  if (kind) query.set("kind", kind);
  const path = `/api/order-log?${query}`;
  const latestHref = `${routes.orderLog}${kind ? `?kind=${kind}` : ""}`;
  const { data, isLoading, stale, failed, retry } = useLiveResource({
    initialData,
    path,
    fetcher: createRouteFetcher(path, orderLogSchema),
  });
  const money = (value: number) => `$ ${new Intl.NumberFormat("id-ID").format(value)}`;
  return (
    <div className="mt-[var(--space-section)] space-y-5">
      <RouteTabs
        label="Order type"
        active={kind}
        items={[
          { key: "", label: "All", href: routes.orderLog },
          { key: "sale", label: "Order", href: `${routes.orderLog}?kind=sale` },
          { key: "purchase", label: "Purchase", href: `${routes.orderLog}?kind=purchase` },
          { key: "internal", label: "SOT Internal Order", href: `${routes.orderLog}?kind=internal` },
        ]}
      />
      {!data ? (
        <ResourceState
          state={isLoading ? "loading" : "unavailable"}
          message="Order log could not be loaded."
          onRetry={() => void retry()}
        />
      ) : (
        <>
          {stale || failed ? (
            <ResourceState state="stale" message="Order log could not be refreshed." onRetry={() => void retry()} />
          ) : null}
          {!data.orders.length ? (
            <ResourceState state="empty" message="No orders recorded." />
          ) : (
            data.orders.map((order) => (
              <article
                key={order.id}
                className={`space-y-4 border border-[var(--color-border)] border-l-4 bg-[var(--color-panel-soft)] p-5 ${order.kind === "internal" ? "border-l-blue-500" : order.kind === "sale" ? "border-l-green-500" : "border-l-red-500"}`}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <h2 className="font-display text-2xl">
                    #{order.id} ·{" "}
                    {translate(
                      order.kind === "internal"
                        ? "SOT Internal"
                        : order.kind === "sale"
                          ? "SOT to Partners"
                          : "Partners to SOT",
                    )}
                  </h2>
                  <span className="font-bold capitalize">{translate(order.status)}</span>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-3">
                  {[
                    [translate("Partner"), order.partner],
                    [translate("Buyer"), order.buyer || "—"],
                    [translate("Order date"), order.order_date],
                    [translate("Pickup date"), order.pickup_date],
                    [translate("Created by"), order.created_by],
                    [
                      translate("Updated"),
                      new Date(order.updated_at).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB",
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[var(--color-foreground-muted)]">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] pt-2"
                    >
                      <span>
                        {item.name} × {item.quantity} {item.unit}
                      </span>
                      <span>{money(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap justify-between gap-3">
                  <span>
                    {translate("Additional")}: {money(order.additional)}
                  </span>
                  <strong className="text-[var(--color-primary)]">
                    {translate("Total")}: {money(order.total)}
                  </strong>
                </div>
                {order.notes ? (
                  <p className="whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">{order.notes}</p>
                ) : null}
              </article>
            ))
          )}
          <nav aria-label={translate("Order pages")} className="flex justify-between gap-4">
            {before ? <Link href={latestHref}>{translate("Latest orders")}</Link> : <span />}
            {data.next_before ? (
              <Link
                href={`${routes.orderLog}?${new URLSearchParams({ ...(kind ? { kind } : {}), before: String(data.next_before) })}`}
              >
                {translate("Older orders")}
              </Link>
            ) : null}
          </nav>
        </>
      )}
    </div>
  );
}
