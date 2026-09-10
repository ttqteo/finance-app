import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

// The API is always served from the same origin as the app, so in the browser
// we resolve the base URL at runtime instead of baking it in. Hardcoding
// NEXT_PUBLIC_APP_URL broke every dashboard fetch whenever `next dev` fell back
// to :3001 (because :3000 was still held by another server): the requests went
// cross-origin, the Clerk cookie was dropped, and react-query sat on its
// retry backoff while the skeletons spun.
const baseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    : window.location.origin;

export const client = hc<AppType>(baseUrl);
