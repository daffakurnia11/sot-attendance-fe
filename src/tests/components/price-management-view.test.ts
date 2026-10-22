import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SWRConfig } from "swr";
import { expect, it } from "vitest";

import { PriceManagementView } from "@/components/organisms/price-management";
import { I18nProvider } from "@/i18n";
import { priceUpdateSchema } from "@/services/price-notes";

it("offers internal price editing without partner selection", () => {
  const html = renderToStaticMarkup(
    createElement(
      I18nProvider,
      null,
      createElement(
        SWRConfig,
        { value: { provider: () => new Map(), isPaused: () => true } },
        createElement(PriceManagementView, {
          direction: "internal",
          initialData: {
            items: [
              {
                id: 1,
                version: 1,
                partner_code: "SOT",
                partner_name: "SOT Internal",
                direction: "internal",
                name: "Vector",
                price: 8500,
                unit: "piece",
                notes: "Member price",
              },
              {
                id: 2,
                version: 1,
                partner_code: "BZ",
                partner_name: "BLADEZAY",
                direction: "sale",
                name: "Partner only",
                price: 8000,
                unit: "piece",
                notes: "",
              },
            ],
          },
        }),
      ),
    ),
  );
  expect(html).toContain("direction=internal");
  expect(html).toContain("SOT Internal");
  expect(html).toContain("Vector");
  expect(html).toContain('value="8500"');
  expect(html).not.toContain("Partner only");
  expect(html).not.toContain('aria-label="Partner"');
  expect(html).toContain('aria-label="Price group"');
  expect(
    priceUpdateSchema.safeParse({ id: 1, direction: "internal", version: 1, price: 9000, unit: "piece", notes: "" })
      .success,
  ).toBe(true);
});
