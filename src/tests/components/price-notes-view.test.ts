import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SWRConfig } from "swr";
import { expect, it } from "vitest";

import { PriceNotesView } from "@/components/organisms/price-notes";
import { I18nProvider } from "@/i18n";
import type { PriceNotes } from "@/services/price-notes";

function render(initialData: PriceNotes, direction: "purchase" | "sale" = "purchase") {
  return renderToStaticMarkup(
    createElement(
      I18nProvider,
      null,
      createElement(
        SWRConfig,
        { value: { provider: () => new Map(), isPaused: () => true } },
        createElement(PriceNotesView, { initialData, direction }),
      ),
    ),
  );
}
it("shows both trade directions, prices and escaped notes", () => {
  const html = render({
    items: [
      {
        id: 1,
        partner_code: "BZ",
        partner_name: "BLADEZAY",
        direction: "purchase",
        name: "Ammo Rifle",
        price: 3100,
        unit: "clip",
        notes: "180 rounds/clip <script>",
      },
      {
        id: 1,
        partner_code: "BZ",
        partner_name: "BLADEZAY",
        direction: "sale",
        name: "Vector",
        price: 8000,
        unit: "piece",
        notes: "20/week (shared)",
      },
    ],
  });
  expect(html).toContain("Partners to SOT");
  expect(html).toContain("SOT to Partners");
  expect(html).toContain("Ammo Rifle");
  expect(html).not.toContain("Vector");
  expect(html).toContain("3.100");
  expect(html).not.toContain("8.000");
  expect(html).toContain("&lt;script&gt;");
  expect(html).toContain("direction=sale");
});
it("distinguishes an empty catalog", () => {
  expect(render({ items: [] })).toContain("No price notes recorded.");
});

it("sale tab shows only SOT prices", () => {
  const html = render(
    {
      items: [
        {
          id: 1,
          partner_code: "BZ",
          partner_name: "BLADEZAY",
          direction: "purchase",
          name: "Ammo Rifle",
          price: 3100,
          unit: "clip",
          notes: "",
        },
        {
          id: 2,
          partner_code: "BZ",
          partner_name: "BLADEZAY",
          direction: "sale",
          name: "Vector",
          price: 8000,
          unit: "piece",
          notes: "20/week (shared)",
        },
      ],
    },
    "sale",
  );
  expect(html).toContain("Vector");
  expect(html).not.toContain("Ammo Rifle");
  expect(html).toContain("20/week (shared)");
});

it("groups competing partner offers beneath one category heading", () => {
  const html = render({
    items: [
      {
        id: 1,
        partner_code: "DTM",
        partner_name: "DON'T TOUCH ME",
        direction: "purchase",
        name: "Vest",
        stock_group: "body_drugs",
        price: 2800,
        unit: "piece",
        notes: "Minimum order: 100.",
      },
      {
        id: 2,
        partner_code: "GWF",
        partner_name: "GWF",
        direction: "purchase",
        name: "Vest",
        stock_group: "body_drugs",
        price: 2800,
        unit: "piece",
        notes: "Unlimited",
      },
    ],
  });
  expect(html.match(/<h2[^>]*>Body &amp; Drugs<\/h2>/g)).toHaveLength(1);
  expect(html).toContain("DTM");
  expect(html).toContain("GWF");
  expect(html).toContain("Minimum order: 100.");
  expect(html).toContain("Unlimited");
});
it("orders sale weapons by class instead of alphabetical order", () => {
  const names = ["CRX MK2", "Vector", "MP9", "Revolver MK2", "Desert Eagle"];
  const html = render(
    {
      items: names.map((name, id) => ({
        id,
        partner_code: "BZ",
        partner_name: "BLADEZAY",
        direction: "sale" as const,
        name,
        price: 5000,
        unit: "piece",
        notes: "",
      })),
    },
    "sale",
  );
  const ordered = ["Desert Eagle", "Revolver MK2", "MP9", "Vector", "CRX MK2"].map((name) =>
    html.indexOf(`<strong>${name}</strong>`),
  );
  expect(ordered.every((position, index) => position >= 0 && (index === 0 || position > ordered[index - 1]))).toBe(
    true,
  );
});
