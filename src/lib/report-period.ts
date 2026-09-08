export function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}
export function formatPeriod(start: string, end: string, locale: "en" | "id") {
  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(`${start}T00:00:00Z`))} – ${formatter.format(new Date(`${end}T00:00:00Z`))}`;
}
export async function fetchPeriodReport<T>(
  endpoint: string,
  month: string | undefined,
  schema: { parse: (value: unknown) => T },
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<T> {
  const response = await fetcher(`${endpoint}${month ? `?month=${encodeURIComponent(month)}` : ""}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Report request failed (${response.status})`);
  return schema.parse(await response.json());
}
