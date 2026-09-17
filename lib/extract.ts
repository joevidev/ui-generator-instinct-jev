/**
 * Value-extraction discipline, corrected: code must not pre-filter candidates
 * using English-only stopword or keyword lists, that silently breaks on any
 * other language even though Jev itself is multilingual. Code's only job is
 * proposing legal, verbatim, language-agnostic candidates; Jev's Choice/Noul
 * judgment (which does understand the text regardless of language) does the
 * actual semantic work of picking or filtering them.
 */

function clauses(text: string): string[] {
  return text
    .split(/[.,;:!?]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function words(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[.,;:!?"'()]+|[.,;:!?"'()]+$/g, ""))
    .filter(Boolean);
}

function windows(tokens: string[], sizes: number[]): string[] {
  const out: string[] = [];
  for (const n of sizes) {
    for (let i = 0; i + n <= tokens.length; i++) {
      out.push(tokens.slice(i, i + n).join(" "));
    }
  }
  return out;
}

/**
 * Whole clauses first (a real unit of meaning in any language), then quoted
 * phrases, then plain sliding windows over the raw words as a last resort.
 * No stopword list: Jev picks the best subject from whatever is offered.
 */
export function entityCandidates(text: string): string[] {
  const candidates: string[] = [];

  const quoted = text.match(/"([^"]{2,40})"|'([^']{2,40})'/g) ?? [];
  for (const q of quoted) candidates.push(q.replace(/["']/g, ""));

  const theClauses = clauses(text);
  candidates.push(...theClauses);

  if (candidates.length < 2) {
    candidates.push(...windows(words(text), [2, 3]));
  }

  const unique = Array.from(new Set(candidates.map((c) => c.trim()).filter(Boolean)));
  return unique.length > 0 ? unique.slice(0, 8) : [text.slice(0, 40)];
}

/**
 * Short spans Jev will independently judge relevant or not (one Noul per
 * candidate in lib/decide.ts), not a pre-filtered English keyword match.
 */
export function fieldSpanCandidates(text: string): string[] {
  const spans = windows(words(text), [1, 2, 3]).filter((s) => s.length >= 3 && s.length <= 24);
  return Array.from(new Set(spans)).slice(0, 12);
}

/**
 * A fixed, always-offered icon catalog, the same shape as the shadcn component
 * catalog: real lucide-react names with a description Jev matches against the
 * case semantically. Never filtered by keyword-matching the input text, that
 * was the bug: it silently only ever worked for English and only for the
 * ~30 concepts someone thought to list. Jev's own multilingual judgment picks
 * from the full set every time, the same way `family` is a standing 7-way
 * choice, never pre-narrowed.
 */
export const ICON_CATALOG: Record<string, string> = {
  Trash2: "deleting or removing something",
  Plus: "adding or creating something new",
  Pencil: "editing or updating something",
  Search: "searching or looking something up",
  User: "a single person, profile, or account",
  Users: "a team, group, or multiple people",
  Mail: "email or messages",
  MessageSquare: "chat or conversation",
  DollarSign: "money, price, or payment amounts",
  Receipt: "an invoice, bill, or purchase record",
  CreditCard: "billing or a payment method",
  CalendarDays: "a date or schedule",
  CalendarClock: "a deadline or upcoming time",
  TriangleAlert: "a warning or something risky",
  CircleCheck: "success, approval, or completion",
  CircleX: "failure, rejection, or an error",
  Settings: "configuration or preferences",
  Download: "downloading or exporting",
  Upload: "uploading or importing",
  Bell: "a notification or reminder",
  Lock: "security or restricted access",
  ShieldCheck: "protection, permissions, or trust",
  FileText: "a document or written report",
  BarChart3: "analytics, statistics, or comparisons",
  TrendingUp: "growth, revenue, or an upward trend",
  MapPin: "a location or address",
  Clock: "time or duration",
  Star: "a favorite or a rating",
  Trophy: "an achievement or a win",
  PartyPopper: "a celebration",
  Cloud: "weather in general",
  CloudRain: "rain or wet weather",
  CloudSun: "partly cloudy or mixed weather",
  Sun: "clear, sunny, or hot weather",
  Snowflake: "cold or snowy weather",
  Wind: "wind or air conditions",
  Thermometer: "temperature",
  Umbrella: "rain protection or forecast planning",
  Leaf: "nature, plants, or sustainability",
  Heart: "health, wellness, or something liked",
  ShoppingCart: "shopping or an order",
  Package: "a shipment or delivery",
  Truck: "shipping or logistics",
  Plane: "travel or a flight",
  Home: "a house, property, or dashboard home",
  Building2: "a company or organization",
  Wifi: "connectivity or network status",
  Smartphone: "a device or mobile app",
  Camera: "photos or media capture",
  Music: "audio or music",
  Video: "video content",
  BookOpen: "learning, docs, or reading",
  Gamepad2: "games or playful features",
  Sparkles: "something new, magical, or AI-related",
};
