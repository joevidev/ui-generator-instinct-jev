/**
 * A modular design-thinking stage, not a style axis: which internal layout
 * pattern fits how this component's facts relate to each other, and which
 * fact (if any) should dominate. Grounded in real content-design conventions
 * (dashboard/KPI card patterns, and Refactoring UI's hierarchy principle:
 * not everything can be equally emphasized), never invented per case. Code
 * proposes the fixed, named patterns; Jev picks with Choice, the same
 * discipline as every other axis in this app.
 *
 * Only fires as an extra call, and only for components where internal layout
 * genuinely varies (currently just `card`), so most cases never pay for it.
 */
export const CARD_COMPOSITIONS = {
  "hero-stat":
    "One fact matters far more than the others, show it large with the icon, the rest stay small underneath. Example: a weather card where the temperature dominates and humidity or wind are secondary.",
  "equal-grid":
    "Several facts matter about equally, no single one should dominate. Example: an account summary where balance, pending, and limit carry the same weight.",
  "media-object":
    "The identity of the thing matters more than any number, icon and text side by side, few or no stats. Example: a person or status card with little numeric data.",
  "list-rows":
    "Several facts belong in a fixed reading order, shown as stacked label or value rows. Example: an order summary reading subtotal, tax, then total.",
} as const;

export type CardComposition = keyof typeof CARD_COMPOSITIONS;

/**
 * Emphasis is not one Choice, it's three separate judgments a designer makes
 * in sequence: is there real hierarchy here at all (Noul, binary), how strong
 * should it be (Score, graded), and which fact carries it (Choice, categorical).
 * Collapsing these into a single question would lose the distinction between
 * "no hierarchy" and "hierarchy, but nothing found to anchor it on."
 */
export const EMPHASIS_LEVELS = [
  "a little more, just slightly bigger",
  "clearly dominant, the main thing on the card",
  "so dominant everything else reads as a small caption",
] as const;

export const EMPHASIS_TEXT_SIZE = ["text-lg", "text-2xl", "text-4xl"] as const;

/** Components whose adapter+render branch on a composition pattern. Extend here as more get one. */
export const COMPOSITION_ELIGIBLE = new Set(["card"]);

/**
 * Chart had the exact same bug as Card, just less visible: the adapter never
 * decided a type, the renderer hardcoded a bar chart regardless of what the
 * case actually asked for. Standard chart taxonomy, not invented: comparing
 * discrete categories, showing a trend, showing a whole broken into parts.
 */
export const CHART_TYPES = {
  bar: "Comparing discrete categories side by side. Example: revenue by region, or votes per candidate.",
  line: "Showing a trend or change over a continuous sequence, usually time. Example: monthly active users over the year.",
  area: "Like a line, but the filled area under it emphasizes volume or magnitude over time. Example: cumulative revenue over the year.",
  pie: "Showing how a whole splits into a few proportional parts. Example: market share by competitor, or budget by category.",
  donut: "The same as pie, a whole split into proportional parts, but with a hollow center often used to show a total or label. Example: storage used by file type, with the total capacity in the middle.",
} as const;

export type ChartType = keyof typeof CHART_TYPES;
