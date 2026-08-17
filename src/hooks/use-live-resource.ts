"use client";

import { useState } from "react";
import useSWR from "swr";

import { isPermanentRouteError } from "@/lib/route-fetcher";

/** Live panels are worth re-reading this often; slower than the bot's poll. */
const REFRESH_INTERVAL_MS = 20_000;

type Options<Data> = Readonly<{
  /** Server-rendered payload, so first paint needs no request. */
  initialData: Data | null;
  /** SWR cache key; the route path. */
  path: string;
  fetcher: () => Promise<Data>;
}>;

/**
 * Keeps a server-rendered payload current.
 *
 * The page still renders its own data, so this only revalidates: on an
 * interval, and when the tab regains focus. The focus case is the one that
 * matters for correctness — a page restored from the browser's back/forward
 * cache would otherwise keep showing whatever it was rendered with.
 *
 * Polling halts permanently on 401 or 403. The app token expires after a couple
 * of hours with no refresh path, and without this a 20-second interval would
 * fire ~180 rejected requests an hour while still showing stale data. `stale`
 * lets the view say so rather than lying quietly.
 */
export function useLiveResource<Data>({ initialData, path, fetcher }: Options<Data>) {
  const [halted, setHalted] = useState(false);

  const { data, error } = useSWR<Data>(path, fetcher, {
    fallbackData: initialData ?? undefined,
    refreshInterval: REFRESH_INTERVAL_MS,
    revalidateOnFocus: true,
    keepPreviousData: true,
    isPaused: () => halted,
    onError: (reason) => {
      if (isPermanentRouteError(reason)) setHalted(true);
    },
  });

  return {
    data: data ?? initialData,
    /** True once refreshing has given up; the data on screen is frozen. */
    stale: halted,
    /** A transient failure, with the last good data still shown. */
    failed: Boolean(error) && !halted,
  };
}
