import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SWRConfig } from "swr";
import { describe, expect, it } from "vitest";

import { DataTable, QuantityItemRow, RouteTabs } from "@/components/atoms";
import { AttendanceView } from "@/components/organisms/dashboard/attendance-view";
import { SafeboxStockView } from "@/components/organisms/safebox-stock";
import { DashboardPage } from "@/components/templates/dashboard-page";
import { I18nProvider, translateMessage } from "@/i18n";

function render(child: React.ReactNode) {
  return renderToStaticMarkup(
    createElement(
      I18nProvider,
      null,
      createElement(SWRConfig, { value: { provider: () => new Map(), isPaused: () => true } }, child),
    ),
  );
}

describe("shared design flows", () => {
  it("keeps the page heading and retry action when attendance is unavailable", () => {
    const html = render(
      createElement(
        DashboardPage,
        { title: "Attendance", eyebrow: "Member records", description: "Monthly attendance records for all members." },
        createElement(AttendanceView, { initialData: null }),
      ),
    );
    expect(html).toMatch(/<h1[^>]*>Attendance<\/h1>/);
    expect(html).toContain("Attendance data could not be loaded.");
    expect(html).toContain("Retry");
    expect(html).not.toContain("No matching members found.");
  });

  it("never fabricates stock when the source is unavailable", () => {
    const html = render(createElement(SafeboxStockView, { initialData: null }));
    expect(html).toMatch(/Loading data\.\.\.|Safebox stock could not be loaded\./);
    expect(html).not.toContain("Python");
    expect(html).not.toContain("<form");
  });

  it("shows zero stock and distinguishes an empty catalog", () => {
    const empty = render(createElement(SafeboxStockView, { initialData: { items: [] } }));
    expect(empty).toContain("No stock items configured.");
    const zero = render(
      createElement(SafeboxStockView, {
        initialData: {
          items: [{ safebox: "public", item_key: "iron", name: "Iron", stock_group: "crafting", quantity: 0 }],
        },
      }),
    );
    expect(zero).toContain("Crafting Stock");
    expect(zero).toContain("Iron");
    expect(zero).not.toContain("No stock items configured.");
  });

  it("preserves table semantics inside the shared panel", () => {
    const tableProps = {
      title: "Player Logs",
      code: "PL",
      columns: [{ label: "Status" }, { label: "Date" }],
      empty: "No matching players found.",
      children: undefined,
    };
    const html = render(createElement(DataTable, tableProps, []));
    expect(html).toContain("<table");
    expect(html).toContain("<td class=");
    expect(html).toContain('colSpan="2"');
    expect(html).toContain("No matching players found.");
  });

  it("keeps route navigation as links and exposes the current page", () => {
    const html = render(
      createElement(RouteTabs, {
        label: "Attendance view",
        active: "recap",
        items: [
          { key: "recap", href: "/attendance?view=recap", label: "Attendance Recap" },
          { key: "calendar", href: "/attendance?view=calendar", label: "Attendance Calendar" },
        ],
      }),
    );
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain('href="/attendance?view=calendar"');
    expect(html).not.toContain('role="tab"');
  });

  it("gives quantity controls translated accessible names", () => {
    const html = render(
      createElement(QuantityItemRow, {
        label: "Weapon 1",
        value: "iron",
        quantity: 1,
        options: [{ label: "Iron", value: "iron" }],
        onItemChange: () => {},
        onQuantityChange: () => {},
        onRemove: () => {},
        removeDisabled: true,
      }),
    );
    expect(html).toContain('aria-label="Quantity for Weapon 1"');
    expect(html).toContain('aria-label="Remove Weapon 1"');
    expect(translateMessage("id", "Item {number}", { number: 2 })).toBe("Barang 2");
    expect(translateMessage("id", "Recipe input")).toBe("Input resep");
  });
});
