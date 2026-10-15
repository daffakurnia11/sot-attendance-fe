import type { Metadata } from "next";

import { PriceNotesView } from "@/components/organisms/price-notes";
import { DashboardPage } from "@/components/templates";
import { loadPriceNotes } from "@/services/price-notes/price-notes.service.server";
export const metadata: Metadata = { title: "Price Notes" };
export default async function PriceNotesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ direction?: string }> }>) {
  const direction = (await searchParams).direction === "sale" ? "sale" : "purchase";
  return (
    <DashboardPage
      title="Price Notes"
      eyebrow="Business operations"
      description="Products from partners and prices offered by SOT."
    >
      <PriceNotesView direction={direction} initialData={await loadPriceNotes()} />
    </DashboardPage>
  );
}
