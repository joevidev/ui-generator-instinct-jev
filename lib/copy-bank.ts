/**
 * Real, bounded, curated word banks — the only "vocabulary" Jev is ever
 * offered for a text-type field's sample value. Jev never free-text
 * generates a name or a label; it picks from these via Choice, one word at
 * a time, chained with the accumulated prior word as context and fanned out
 * (every possible next-word branch asked in the same call) so a two-word
 * value costs no extra round trip, only extra tokens.
 */
export const NAME_FIRST = ["Ava", "Liam", "Sofia", "Noah", "Mia", "Ethan"] as const;
export const NAME_LAST = ["Garcia", "Chen", "Smith", "Kim", "Rossi", "Silva"] as const;
export const STATUS_PHRASES = ["Active", "Pending", "Completed", "Cancelled", "In Review", "Approved"] as const;
export const LABEL_WORD1 = ["Starter", "Pro", "Growth", "Essential", "Premium"] as const;
export const LABEL_WORD2 = ["Plan", "Tier", "Package", "Suite"] as const;

export type ValueCategory = "person_name" | "status" | "label";

export const VALUE_CATEGORY_DESCRIPTIONS: Record<ValueCategory, string> = {
  person_name: "a person's full name",
  status: "a short status or state word",
  label: "a short generic label, like a plan or tier name",
};
