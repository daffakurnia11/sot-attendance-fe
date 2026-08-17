import type { z } from "zod";

/**
 * A non-OK response from one of this app's own route handlers.
 *
 * Carries the status so polling can distinguish "try again later" from "stop
 * asking": the routes answer 401 once the app token expires and 403 for a
 * non-admin, and neither is fixed by retrying.
 */
export class RouteError extends Error {
  constructor(public readonly status: number) {
    super(`route responded ${status}`);
    this.name = "RouteError";
  }
}

/** A 401 or 403 will never succeed on retry; anything else might. */
export function isPermanentRouteError(error: unknown): boolean {
  return error instanceof RouteError && (error.status === 401 || error.status === 403);
}

/**
 * Builds a fetcher for a route handler, validated with the same schema the
 * server uses. Browser-side, so the app token stays in the httpOnly cookie and
 * never reaches this code.
 */
export function createRouteFetcher<Schema extends z.ZodType>(path: string, schema: Schema) {
  return async function fetchRoute(): Promise<z.infer<Schema>> {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new RouteError(response.status);
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) throw new Error(`${path} returned invalid data`);
    return parsed.data;
  };
}
