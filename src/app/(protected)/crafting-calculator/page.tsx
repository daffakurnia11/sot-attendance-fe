import type { Metadata } from "next";

import { CraftingCalculatorView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadCraftingRecipes } from "@/services/crafting/crafting.service.server";

export const metadata: Metadata = { title: "Crafting Calculator" };

export default async function CraftingCalculatorPage() {
  return (
    <DashboardPage
      description="Calculate material totals for any saved weapon recipe."
      eyebrow="Business operations"
      title="Crafting Calculator"
    >
      <CraftingCalculatorView initialData={await loadCraftingRecipes()} />
    </DashboardPage>
  );
}
