import "server-only";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { decide } from "@/lib/decide";
import { CATALOG } from "@/lib/catalog";
import type { RawInput } from "@/lib/intake";

const app = new Hono().basePath("/api");

app.get("/catalog", (c) => c.json({ catalog: CATALOG }));

app.post("/decide", async (c) => {
  const input = (await c.req.json()) as RawInput;
  if (!input.text || input.text.trim().length === 0) {
    return c.json({ error: "text is required" }, 422);
  }
  const decision = await decide(input);
  return c.json(decision);
});

export const GET = handle(app);
export const POST = handle(app);
