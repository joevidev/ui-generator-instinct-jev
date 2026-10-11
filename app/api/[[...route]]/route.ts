import "server-only";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie, setCookie } from "hono/cookie";
import { decide } from "@/lib/decide";
import { CATALOG } from "@/lib/catalog";
import type { RawInput } from "@/lib/intake";
import {
  FREE_GENERATIONS,
  REMAINING_HEADER,
  USAGE_COOKIE,
  parseUsage,
  remainingFree,
  type QuotaError,
} from "@/lib/rate-limit";

const app = new Hono().basePath("/api");

app.get("/catalog", (c) => c.json({ catalog: CATALOG }));

app.get("/quota", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({ remaining: remainingFree(parseUsage(getCookie(c, USAGE_COOKIE))), limit: FREE_GENERATIONS });
});

app.post("/decide", async (c) => {
  const input = (await c.req.json()) as RawInput;
  if (!input.text || input.text.trim().length === 0) {
    return c.json({ error: "text is required" }, 422);
  }

  const ownKey = input.apiKey?.trim();
  const used = parseUsage(getCookie(c, USAGE_COOKIE));

  // Only the repo owner's shared key is metered. A visitor spending their own
  // credits is never counted and never blocked.
  if (!ownKey && used >= FREE_GENERATIONS) {
    return c.json({ error: "quota_exceeded", used, limit: FREE_GENERATIONS } satisfies QuotaError, 429);
  }

  let decision;
  try {
    decision = await decide({ text: input.text, apiKey: ownKey || undefined });
  } catch (err) {
    // A visitor pasting a wrong key, or a key with no credits left, otherwise
    // gets a bare 500 with nothing pointing at the key as the cause.
    const status = (err as { status?: number }).status;
    const upstream = (err as { body?: { detail?: { message?: string } } }).body?.detail?.message;
    if (ownKey && (status === 401 || status === 403)) {
      return c.json({ error: "invalid_key", message: "That TypeSafe API key was rejected." }, 401);
    }
    if (status === 402) {
      return c.json(
        { error: "no_credits", message: upstream ?? "That TypeSafe account has no available credits." },
        402
      );
    }
    throw err;
  }

  // Counted only on success: a failed call (bad key, no credits, network) costs
  // the visitor a generation they never got.
  if (!ownKey) {
    setCookie(c, USAGE_COOKIE, String(used + 1), {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    c.header(REMAINING_HEADER, String(remainingFree(used + 1)));
  }

  return c.json(decision);
});

export const GET = handle(app);
export const POST = handle(app);
