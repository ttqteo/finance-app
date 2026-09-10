"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Renders `fallback` on the server and during hydration, `children` after.
 *
 * Exists for a race on the overview. Five components read the same ["summary"]
 * query, and one of them — AccountFilter — lives in the header, which hydrates
 * before the page body. It starts the fetch; the endpoint is a single fast RPC,
 * so the response can land before DataGrid has hydrated. DataGrid's first
 * client render then sees cached data and draws its success branch over server
 * HTML that was its loading branch, and React throws the tree away.
 *
 * `useSyncExternalStore` is the reliable way to gate this: React uses the
 * *server* snapshot (`false`) while hydrating, so the first client render is
 * guaranteed to match the server, then re-renders with `true`. On a client-side
 * navigation there is no hydration and it returns `true` immediately, so this
 * adds no extra skeleton frame there.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  return hydrated ? children : fallback;
}
