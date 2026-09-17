export type Tone = "neutral" | "playful" | "formal";

/** What the client sends: one free-text box, nothing pre-structured. */
export interface RawInput {
  text: string;
}

export const EMPTY_INPUT: RawInput = { text: "" };

/**
 * What `decide()` resolves the raw text into before handing off to
 * `lib/families.ts` / `lib/adapters.ts`, which are unaware anything changed:
 * `entity` and `fields` are candidates extracted by code (`lib/extract.ts`)
 * and selected by Jev, never generated. `case` is the raw text itself, it
 * needs no extraction, it already is the free-form description.
 */
export interface Intake {
  case: string;
  entity: string;
  fields: string[];
  tone: Tone;
}
