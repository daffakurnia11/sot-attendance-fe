import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SWRConfig } from "swr";
import { expect, it } from "vitest";

import { OrderLogView } from "@/components/organisms/order-log";
import { I18nProvider } from "@/i18n";
import type { OrderLog } from "@/services/order-log";

function render(data: OrderLog, kind = "") {
  return renderToStaticMarkup(
    createElement(
      I18nProvider,
      null,
      createElement(
        SWRConfig,
        { value: { provider: () => new Map(), isPaused: () => true } },
        createElement(OrderLogView, { initialData: data, kind }),
      ),
    ),
  );
}
it("renders saved order details and older page navigation safely", () => {
  const html = render({
    orders: [
      {
        id: 9,
        kind: "internal",
        partner: "SOT Internal",
        buyer: "Buyer <script>",
        status: "ready",
        order_date: "2026-10-22",
        pickup_date: "2026-10-24",
        additional: 500,
        total: 19000,
        notes: "<script>unsafe</script>",
        created_at: "2026-10-22T10:00:00Z",
        updated_at: "2026-10-22T11:00:00Z",
        created_by: "Admin",
        items: [{ name: "Vector package", unit: "package", price: 18500, quantity: 1 }],
      },
    ],
    next_before: 9,
  });
  expect(html).toContain("SOT Internal");
  expect(html).toContain("Vector package");
  expect(html).toContain("19.000");
  expect(html).toContain("Buyer &lt;script&gt;");
  expect(html).toContain("before=9");
  expect(html).not.toContain("<script>");
});
it("shows explicit empty state", () => {
  expect(render({ orders: [], next_before: 0 })).toContain("No orders recorded.");
});

it("keeps order type in pagination links and marks selected filter", () => {
  const html = render({ orders: [], next_before: 9 }, "internal");
  expect(html).toContain('href="/order-log?kind=internal&amp;before=9"');
  expect(html).toContain("SOT Internal Order");
  expect(html).toContain('aria-current="page"');
  expect(html).toContain('href="/order-log?kind=sale"');
  expect(html).toContain('href="/order-log?kind=purchase"');
});
