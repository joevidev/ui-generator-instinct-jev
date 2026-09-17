/**
 * Jev doesn't just pick the component, it also art-directs it: a small, bounded
 * set of font pairings, color themes, and density levels, chosen the same way as
 * everything else (Choice/Score over fixed options), never generated CSS.
 */
export const FONT_PRESETS = {
  geist: "Clean, technical, precise. Example: a dashboard, an API console, a settings page.",
  editorial: "Warm, considered, literary. Example: a policy document, an About page, long-form content.",
  grotesk: "Confident, modern, startup-y. Example: a product launch page, a pricing page.",
  classic: "Neutral, safe, enterprise. Example: an internal admin tool, a compliance form.",
} as const;

export const THEME_PRESETS = {
  neutral: "Grayscale, no strong color signal. Example: internal tooling, settings, neutral status.",
  blue: "Trustworthy, financial, corporate. Example: invoices, payments, banking, contracts.",
  green: "Positive, growth-oriented. Example: approvals, completed states, savings.",
  purple: "Creative, playful, premium. Example: design tools, community features, a member profile.",
  amber: "Urgent, attention-grabbing, warm. Example: warnings, deadlines, expiring items.",
} as const;

export const DENSITY_LEVELS = [
  "compact, the case is a quick utility glanced at often",
  "comfortable, an everyday working screen",
  "spacious, a considered, occasional, higher-stakes moment",
] as const;

export const RADIUS_PRESETS = {
  sharp: "Crisp, technical, precise. Example: a compliance form, a data console, engineering tooling.",
  soft: "Approachable, modern, default product feel. Example: everyday SaaS, most business tools.",
  pill: "Friendly, casual, consumer-facing. Example: a social feature, a playful onboarding flow.",
} as const;

export const MOTION_PRESETS = {
  static: "Instant, no transition, nothing to prove. Example: a dense internal tool, a data console.",
  subtle: "A quiet fade and settle, present but never showy. Example: most everyday product moments.",
  expressive: "A confident entrance the user notices, a moment worth marking. Example: a completed purchase, an unlocked achievement, a first-run welcome.",
} as const;

export const ELEVATION_PRESETS = {
  flat: "No shadow, a border is enough. Example: inline content, dense lists, internal tools.",
  soft: "A gentle neutral shadow to lift it off the page. Example: a card among other cards, an everyday panel.",
  tinted: "A shadow tinted with the theme color, for a moment that should feel considered. Example: a hero action, a featured card, a premium confirmation.",
} as const;

export type FontPreset = keyof typeof FONT_PRESETS;
export type ThemePreset = keyof typeof THEME_PRESETS;
export type Density = "compact" | "comfortable" | "spacious";
export type Radius = keyof typeof RADIUS_PRESETS;
export type Motion = keyof typeof MOTION_PRESETS;
export type Elevation = keyof typeof ELEVATION_PRESETS;

export const DENSITY_BY_SCORE: Density[] = ["compact", "comfortable", "spacious"];
