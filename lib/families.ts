import { choice, noul, score } from "@typesafe-ai/sdk";
import type { CatalogEntry, Family } from "./catalog";

/**
 * One fill question block per family with a deep adapter. All of these are asked
 * speculatively in the same request as the routing `component` question (TypeSafe's
 * route-and-fill / fan-out pattern): every question runs in parallel with no added
 * latency, and the code below only reads the block belonging to the family Jev
 * actually picked.
 */
export const FILL_QUESTIONS = {
  action_variant: choice("What visual weight fits this action?", {
    default: "the main call to action on the case",
    outline: "a secondary action, present but not the focus",
    secondary: "a lower emphasis action",
    ghost: "a minimal, low emphasis action",
    destructive: "an action that deletes or removes something",
    link: "an inline, text like action",
  }),
  action_prominence: score("How prominent should this action be?", [
    "small and compact",
    "default size",
    "large and prominent",
  ] as const),

  data_density: score("How much data does the user need to see at once for this case?", [
    "just a summary, a few key facts",
    "a short list, a handful of rows",
    "a dense set with many rows",
  ] as const),
  data_needs_action: noul("Does the user need to act on each row or item individually, not just view it?"),

  input_option_count: score("How many distinct options or fields does this case require?", [
    "one single choice or field",
    "a handful, three to five",
    "many, six or more",
  ] as const),
  input_required: noul("Is providing a value here required before the user can continue?"),

  nav_section_count: score("How many distinct sections or views does this case need?", [
    "two sections",
    "three or four sections",
    "five or more sections",
  ] as const),

  feedback_kind: choice("What kind of feedback is this?", {
    default: "neutral, informational",
    destructive: "a warning or error the user must notice",
  }),

  overlay_destructive: noul("Does confirming this interrupt delete, remove, or change something in a way that is hard to undo?"),

  layout_item_count: score("How many distinct items or sections should be grouped and collapsible?", [
    "two or three items",
    "four to six items",
    "seven or more items",
  ] as const),
  layout_exclusive: noul("Should only one section be open at a time, like a step-by-step flow, rather than several open at once like an FAQ?"),
} as const;

export type FillQuestions = typeof FILL_QUESTIONS;
export type FillKey = keyof FillQuestions;

/** Which fill question keys belong to each family; only these are read once Jev routes to that family. */
export const FAMILY_FILL_KEYS: Record<Family, FillKey[]> = {
  action: ["action_variant", "action_prominence"],
  data_display: ["data_density", "data_needs_action"],
  input: ["input_option_count", "input_required"],
  navigation: ["nav_section_count"],
  feedback: ["feedback_kind"],
  overlay: ["overlay_destructive"],
  layout: ["layout_item_count", "layout_exclusive"],
};

/**
 * Level-2 of the hierarchy: once a family is shortlisted, ask which of its
 * specific members fits, over a much smaller (2-5 option) sibling set instead
 * of the flat 23-way choice. Few-shot: each member's own description already
 * carries a concrete example (see lib/catalog.ts).
 */
export function buildLeafChoice(family: Family, members: CatalogEntry[]) {
  const criteria = Object.fromEntries(members.map((m) => [m.id, m.description]));
  return choice(
    `Within the "${family}" family, which specific component best fits this case?`,
    criteria
  );
}
