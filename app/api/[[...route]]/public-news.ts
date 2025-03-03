import { db } from "@/db/drizze";
import { accounts, categories, transactions } from "@/db/schema";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parse, subDays } from "date-fns";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      url: z.string().optional(),
    })
  ),
  async (c) => {
    const { url } = c.req.valid("query");

    if (!url) {
      return c.json({ error: "Missing RSS URL" }, 400);
    }

    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await resp.text();
    return c.json(data);
  }
);

export default app;
