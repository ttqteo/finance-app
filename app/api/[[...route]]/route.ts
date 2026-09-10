import { Hono } from "hono";
import { handle } from "hono/vercel";
import accounts from "./accounts";
import categories from "./categories";
import settings from "./settings";
import summary from "./summary";
import transactions from "./transactions";
import subscriptions from "./subscriptions";

// Đổi sang "nodejs" hồi còn dùng postgres-js, vì nó nói TCP nên không chạy
// được trên edge (`neon-http` trước đó đi bằng fetch nên chạy được).
//
// Giờ `db/drizze.ts` đã xoá và mọi handler dùng supabase-js — cũng đi bằng
// fetch — nên VỀ NGUYÊN TẮC trả lại "edge" được. Vẫn để "nodejs" vì chưa chạy
// thật lần nào để kiểm chứng: đổi mò mà hỏng thì hỏng cả tầng API mà không lộ
// nguyên nhân, trong khi để nguyên thì chẳng mất gì.
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
