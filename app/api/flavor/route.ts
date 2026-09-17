import "server-only";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { Intake } from "@/lib/intake";

/**
 * The one place in this app that generates free text instead of selecting it.
 * Kept isolated from /api/decide on purpose: Jev never generates copy, it only
 * ever picks a component and a structure. This is a cosmetic, non-critical extra.
 */
export async function POST(req: Request) {
  const intake = (await req.json()) as Intake;

  const { text } = await generateText({
    model: anthropic("claude-sonnet-5"),
    prompt: `Write one short, ${intake.tone} empty-state line (under 12 words, no quotes) for a "${intake.entity}" UI. Case: ${intake.case}`,
    providerOptions: { anthropic: { effort: "low" } },
  });

  return Response.json({ line: text.trim() });
}
