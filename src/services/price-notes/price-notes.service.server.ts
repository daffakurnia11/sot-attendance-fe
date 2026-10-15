import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchPriceNotes } from "./price-notes-api";
export function loadPriceNotes() {
  return loadForMember("/price-notes", fetchPriceNotes);
}
