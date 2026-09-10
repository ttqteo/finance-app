import { Hono } from "hono";
import { handle } from "hono/vercel";
import accounts from "./accounts";
import categories from "./categories";
import settings from "./settings";
import summary from "./summary";
import transactions from "./transactions";
import subscriptions from "./subscriptions";

// postgres-js nói TCP nên không chạy được trên edge — `neon-http` trước đây
// chạy được vì nó đi bằng fetch. Khi nào `db/drizze.ts` bị xoá hẳn (mọi handler
// dùng supabase-js, vốn cũng đi bằng fetch) thì trả lại "edge" được.
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/subscriptions", subscriptions)
  .route("/summary", summary)
  .route("/settings", settings);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
