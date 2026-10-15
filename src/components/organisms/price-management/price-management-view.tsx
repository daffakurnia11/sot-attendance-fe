"use client";
import { Select } from "antd";
import { useState } from "react";

import { Button, Field, ResourceState, RouteTabs } from "@/components/atoms";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { fetchPriceNotesRoute, type PriceNotes, priceUpdateSchema } from "@/services/price-notes";
export function PriceManagementView({
  initialData,
  direction,
}: {
  initialData: PriceNotes | null;
  direction: "purchase" | "sale";
}) {
  const { data, retry, isLoading, stale, failed } = useLiveResource({
    initialData,
    path: "/api/price-notes",
    fetcher: fetchPriceNotesRoute,
  });
  const [partner, setPartner] = useState("");
  const entries = data?.items.filter((item) => item.direction === direction) ?? [];
  const codes = [...new Set(entries.map((item) => item.partner_code))];
  const selected = codes.includes(partner) ? partner : codes[0];
  return (
    <>
      <RouteTabs
        label="Price direction"
        active={direction}
        items={[
          { key: "purchase", label: "Partners to SOT", href: `${routes.priceManagement}?direction=purchase` },
          { key: "sale", label: "SOT to Partners", href: `${routes.priceManagement}?direction=sale` },
        ]}
      />
      <div className="mt-[var(--space-section)] space-y-4">
        {!data ? (
          <ResourceState
            state={isLoading ? "loading" : "unavailable"}
            message="Price notes could not be loaded."
            onRetry={() => void retry()}
          />
        ) : (
          <>
            {stale || failed ? (
              <ResourceState state="stale" message="Price notes could not be refreshed." onRetry={() => void retry()} />
            ) : null}
            <Field label="Partner">
              <Select
                aria-label="Partner"
                className="w-full"
                value={selected}
                onChange={setPartner}
                showSearch={{ optionFilterProp: "label" }}
                options={codes.map((code) => ({
                  value: code,
                  label:
                    entries.find((item) => item.partner_code === code)?.partner_name === code
                      ? code
                      : `${entries.find((item) => item.partner_code === code)?.partner_name} · ${code}`,
                }))}
              />
            </Field>
            {entries.length === 0 ? (
              <ResourceState state="empty" message="No price notes recorded." />
            ) : (
              entries
                .filter((item) => item.partner_code === selected)
                .map((item) => <PriceRow key={`${item.direction}-${item.id}`} item={item} refresh={retry} />)
            )}
          </>
        )}
      </div>
    </>
  );
}
function PriceRow({ item, refresh }: { item: PriceNotes["items"][number]; refresh: () => Promise<unknown> }) {
  const [price, setPrice] = useState(String(item.price));
  const [unit, setUnit] = useState(item.unit);
  const [notes, setNotes] = useState(item.notes);
  const [version, setVersion] = useState(item.version);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  function reset() {
    setPrice(String(item.price));
    setUnit(item.unit);
    setNotes(item.notes);
    setVersion(item.version);
    setFeedback("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const parsed = priceUpdateSchema.safeParse({
      id: item.id,
      direction: item.direction,
      version,
      price: price.trim() === "" ? NaN : Number(price),
      unit,
      notes,
    });
    if (!parsed.success) {
      setFeedback("Enter a valid whole-number price, unit and notes.");
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/price-management", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) {
        setFeedback(result.error ?? "Price could not be saved");
        return;
      }
      setVersion(result.version);
      setUnit(parsed.data.unit);
      setFeedback("Saved.");
      await refresh();
    } catch {
      setFeedback("Could not save. Refresh before retrying.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-4 border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">{item.name}</h2>
          {item.stock_item_name && item.stock_item_name !== item.name ? (
            <p className="text-sm text-[var(--color-foreground-muted)]">{item.stock_item_name}</p>
          ) : null}
        </div>
      </div>
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price">
            <input
              className="w-full border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-3"
              type="number"
              min="0"
              step="1"
              required
              value={price}
              disabled={busy}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Field label="Unit">
            <input
              className="w-full border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-3"
              required
              maxLength={50}
              value={unit}
              disabled={busy}
              onChange={(e) => setUnit(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            className="w-full border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-3"
            maxLength={2000}
            rows={3}
            value={notes}
            disabled={busy}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <div className="flex gap-3">
          <Button htmlType="submit" disabled={busy}>
            Save
          </Button>
          <Button htmlType="button" disabled={busy} onClick={reset}>
            Reset
          </Button>
        </div>
      </>

      {feedback ? <p role="status">{feedback}</p> : null}
    </form>
  );
}
