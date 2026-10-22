import { ResourceState } from "@/components/atoms";
import { useI18n } from "@/i18n";
import type { PriceNotes } from "@/services/price-notes";
import { stockGroups } from "@/services/safebox-stock";

export function InternalPrices({ items }: { items: PriceNotes["items"] }) {
  const { translate } = useI18n();
  if (!items.length) return <ResourceState state="empty" message="No price notes recorded." />;
  const groups = new Map<string, PriceNotes["items"]>();
  for (const item of items.filter((item) => item.unit !== "package")) {
    const key = item.stock_group || "other";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const preferredOrder = ["weapon", "ammo", "body_drugs"];
  const groupKeys = [...groups.keys()].sort((a, b) => {
    const rank = (key: string) => {
      const index = preferredOrder.indexOf(key);
      return index < 0 ? preferredOrder.length : index;
    };
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  const cards = (entries: PriceNotes["items"], grouped: boolean) => (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((item) => (
        <li key={item.id} className="border border-[var(--color-border)] p-4">
          {grouped ? (
            <h4 className="text-lg font-bold">{translate(item.name)}</h4>
          ) : (
            <h3 className="text-lg font-bold">{translate(item.name)}</h3>
          )}
          <p className="mt-2 font-bold text-[var(--color-primary)]">
            $ {new Intl.NumberFormat("id-ID").format(item.price)} / {translate(item.unit)}
          </p>
          {item.notes ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--color-foreground-muted)] [overflow-wrap:anywhere]">
              {item.notes}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <section className="border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-5">
        <h2 className="font-display text-2xl uppercase">{translate("Member packages")}</h2>
        {cards(
          items.filter((item) => item.unit === "package"),
          false,
        )}
      </section>
      <section className="border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-5">
        <h2 className="font-display text-2xl uppercase">{translate("À la carte")}</h2>
        {groupKeys.map((key) => (
          <section key={key} className="mt-6">
            <h3 className="font-display text-xl uppercase">
              {translate(
                key === "weapon"
                  ? "Weapons"
                  : (stockGroups.find((group) => group.key === key)?.label.replace(/ Stock$/, "") ?? "Other"),
              )}
            </h3>
            {cards(groups.get(key)!, true)}
          </section>
        ))}
      </section>
    </>
  );
}
