import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SWRConfig } from "swr";
import { expect, it } from "vitest";

import { PriceNotesView } from "@/components/organisms/price-notes";
import { I18nProvider } from "@/i18n";
import type { PriceNotes } from "@/services/price-notes";

function render(initialData: PriceNotes, direction: "purchase" | "sale" | "internal" = "purchase") {
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

it("shows internal database prices and packages without partner offers", () => {
  const html = render(
    {
      items: [
        {
          id: 1,
          partner_code: "SOT",
          partner_name: "SOT Internal",
          direction: "internal",
          name: "Vector",
          price: 8500,
          unit: "piece",
          notes: "",
        },
        {
          id: 2,
          partner_code: "SOT",
          partner_name: "SOT Internal",
          direction: "internal",
          name: "Python",
          price: 16000,
          unit: "package",
          notes: "2 Joint: Free",
        },
        {
          id: 3,
          partner_code: "BZ",
          partner_name: "BLADEZAY",
          direction: "sale",
          name: "Partner only",
          price: 1,
          unit: "piece",
          notes: "",
        },
      ],
    },
    "internal",
  );
  expect(html).toContain("Member packages");
  expect(html).toContain("À la carte");
  expect(html).toContain("8.500");
  expect(html).toContain("16.000");
  expect(html).toContain("2 Joint: Free");
  expect(html).not.toContain("Partner only");
});

it("groups internal ala carte by stock category, keeping packages separate", () => {
  const entry = {
    partner_code: "SOT",
    partner_name: "SOT Internal",
    direction: "internal" as const,
    price: 100,
    unit: "piece",
    notes: "",
  };
  const html = render(
    {
      items: [
        { ...entry, id: 1, name: "Vector", stock_group: "weapon" },
        { ...entry, id: 2, name: "Ammo Pistol", stock_group: "ammo" },
        { ...entry, id: 3, name: "Joint", stock_group: "body_drugs" },
        { ...entry, id: 4, name: "Body Armor", stock_group: "body_drugs" },
        { ...entry, id: 5, name: "Package only", unit: "package", stock_group: "weapon" },
        { ...entry, id: 6, name: "Uncategorized" },
      ],
    },
    "internal",
  );
  const headings = ["Weapons", "Ammo", "Body &amp; Drugs", "Other"];
  const positions = headings.map((name) => html.indexOf(`>${name}</h3>`));
  expect(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1]))).toBe(
    true,
  );
  const bodyGroup = html.slice(positions[2], positions[3]);
  expect(bodyGroup).toContain("Joint");
  expect(bodyGroup).toContain("Body Armor");
  expect(bodyGroup).not.toContain("Vector");
  expect(html.slice(html.indexOf("À la carte"))).not.toContain("Package only");
});
