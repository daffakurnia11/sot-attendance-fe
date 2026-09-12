import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SettingsView } from "@/components/organisms/settings";
import { SafeboxStockSettings } from "@/components/organisms/settings/safebox-stock-settings";
import { I18nProvider } from "@/i18n";
import type { SettingsData } from "@/services/settings";

function render(child: React.ReactNode) {
  return renderToStaticMarkup(createElement(I18nProvider, null, child));
}

const settings: SettingsData = {
  is_admin: true,
  start_attendance: "21:00",
  end_attendance: "01:00",
  playtime_threshold: "90m",
  player_threshold: "15",
  payment_contract: "8000000",
  attendance_minimum: "24",
  attendance_maximum: "30",
  start_date_contract: "28",
  office_money_balance: "0",
  dirty_money_balance: "0",
};

const stock = {
  items: [
    { safebox: "public" as const, item_key: "mp9", name: "MP9", stock_group: "weapon" as const, quantity: 10 },
    { safebox: "public" as const, item_key: "iron", name: "Iron", stock_group: "crafting" as const, quantity: 12 },
    { safebox: "boss" as const, item_key: "copper", name: "Copper", stock_group: "crafting" as const, quantity: 3 },
  ],
};

describe("settings view", () => {
  it("offers a tab for each settings group", () => {
    const html = render(createElement(SettingsView, { initialData: settings, safeboxStock: stock }));
    expect(html).toContain("Attendance settings");
    expect(html).toContain("Money settings");
    expect(html).toContain("Safebox stock settings");
  });

  it("locks every safebox control for a non-admin so only the server-side gate can be reached", () => {
    const html = render(createElement(SafeboxStockSettings, { initialData: stock, isAdmin: false }));
    expect(html).toContain("Admin required");
    expect(html).not.toContain("Set the current balance of an item");
    // Every interactive control in the form renders disabled, so a member who
    // reaches this component cannot compose a transaction at all.
    expect(html.match(/<(?:button|input)(?![^>]*\bdisabled\b)[^>]*>/g)).toBeNull();
  });


  it("prefills each item of the selected safebox with its current balance", () => {
    const html = render(createElement(SafeboxStockSettings, { initialData: stock, isAdmin: true }));
    expect(html).toContain("Iron");
    expect(html).toContain('value="12"');
    // The boss safebox is a separate balance; its items must not leak into the
    // public tab, where saving would rewrite the wrong safebox.
    expect(html).not.toContain("Copper");
    expect(html).not.toContain('value="3"');
  });

  it("groups items under their stock group, in the shared group order", () => {
    const html = render(createElement(SafeboxStockSettings, { initialData: stock, isAdmin: true }));
    // Crafting precedes weapons in stockGroups even though the weapon item
    // comes first in the payload, so the headings order the page, not the API.
    expect(html.match(/>(Crafting Stock|Weapon Stock|Iron|MP9)</g)).toEqual([
      ">Crafting Stock<",
      ">Iron<",
      ">Weapon Stock<",
      ">MP9<",
    ]);
    // A group with no item in this safebox gets no empty heading.
    expect(html).not.toContain("Ammo Stock");
  });
});
