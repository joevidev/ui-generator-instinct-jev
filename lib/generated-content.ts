import "server-only";
import { choice, type ChoiceResponse, type Question } from "@typesafe-ai/sdk";
import {
  NAME_FIRST,
  NAME_LAST,
  STATUS_PHRASES,
  LABEL_WORD1,
  LABEL_WORD2,
  VALUE_CATEGORY_DESCRIPTIONS,
  type ValueCategory,
} from "./copy-bank";
import { formatMockValue, type FieldType } from "./field-types";

export type GeneratedField =
  | { category: "person_name"; firstIndex: number; lastIndex: number }
  | { category: "status"; index: number }
  | { category: "label"; word1Index: number; word2Index: number };

/**
 * Every question a text-type field could need, asked speculatively for every
 * candidate field in one call: which category of value it holds, then the
 * word(s) for that category. The label category chains for real — each
 * word-2 question names the word-1 it would follow ("the label already
 * starts with X"), and every possible X is asked in the same call, so the
 * actual winning branch is picked after the fact with no extra round trip.
 */
export function buildContentQuestions(fields: string[]): Record<string, Question> {
  const questions: Record<string, Question> = {};
  for (const field of fields) {
    questions[`content_category__${field}`] = choice(
      `What kind of short sample value would realistically fill the "${field}" field for this case?`,
      VALUE_CATEGORY_DESCRIPTIONS satisfies Record<ValueCategory, string>
    );
    questions[`content_name_first__${field}`] = choice(
      `If the "${field}" field holds a person's name, which first name fits this case best?`,
      Object.fromEntries(NAME_FIRST.map((w) => [w, null]))
    );
    questions[`content_name_last__${field}`] = choice(
      `If the "${field}" field holds a person's name, which last name pairs with it?`,
      Object.fromEntries(NAME_LAST.map((w) => [w, null]))
    );
    questions[`content_status__${field}`] = choice(
      `If the "${field}" field holds a status, which one fits this case best?`,
      Object.fromEntries(STATUS_PHRASES.map((w) => [w, null]))
    );
    questions[`content_label_word1__${field}`] = choice(
      `If the "${field}" field holds a short generic label, which first word fits this case best?`,
      Object.fromEntries(LABEL_WORD1.map((w) => [w, null]))
    );
    for (const w1 of LABEL_WORD1) {
      questions[`content_label_word2__${field}__${w1}`] = choice(
        `The label for the "${field}" field already starts with "${w1}" — which second word completes it best for this case?`,
        Object.fromEntries(LABEL_WORD2.map((w) => [w, null]))
      );
    }
  }
  return questions;
}

export function resolveGeneratedFields(
  fields: string[],
  answers: Record<string, ChoiceResponse>
): Record<string, GeneratedField> {
  const result: Record<string, GeneratedField> = {};
  for (const field of fields) {
    const category = answers[`content_category__${field}`]?.choice as ValueCategory | undefined;
    if (category === "person_name") {
      const first = answers[`content_name_first__${field}`]?.choice;
      const last = answers[`content_name_last__${field}`]?.choice;
      result[field] = {
        category,
        firstIndex: Math.max(0, NAME_FIRST.indexOf(first as (typeof NAME_FIRST)[number])),
        lastIndex: Math.max(0, NAME_LAST.indexOf(last as (typeof NAME_LAST)[number])),
      };
    } else if (category === "status") {
      const s = answers[`content_status__${field}`]?.choice;
      result[field] = { category, index: Math.max(0, STATUS_PHRASES.indexOf(s as (typeof STATUS_PHRASES)[number])) };
    } else {
      const w1 = (answers[`content_label_word1__${field}`]?.choice as (typeof LABEL_WORD1)[number]) ?? LABEL_WORD1[0];
      const w2 = answers[`content_label_word2__${field}__${w1}`]?.choice;
      result[field] = {
        category: "label",
        word1Index: Math.max(0, LABEL_WORD1.indexOf(w1)),
        word2Index: Math.max(0, LABEL_WORD2.indexOf(w2 as (typeof LABEL_WORD2)[number])),
      };
    }
  }
  return result;
}

/** Row 0 is exactly what Jev chose; further rows vary within the same real
 * vocabulary it picked from, deterministically — not a second Jev decision
 * per row, which would multiply the call's cost by the row count. */
export function renderGeneratedValue(g: GeneratedField, row: number): string {
  switch (g.category) {
    case "person_name":
      return `${NAME_FIRST[(g.firstIndex + row) % NAME_FIRST.length]} ${NAME_LAST[(g.lastIndex + row) % NAME_LAST.length]}`;
    case "status":
      return STATUS_PHRASES[(g.index + row) % STATUS_PHRASES.length];
    case "label":
      return `${LABEL_WORD1[(g.word1Index + row) % LABEL_WORD1.length]} ${LABEL_WORD2[g.word2Index]}`;
  }
}

export function cellValue(
  field: string,
  row: number,
  fieldTypes: Record<string, FieldType>,
  generatedContent: Record<string, GeneratedField>
): string {
  const type = fieldTypes[field] ?? "text";
  if (type !== "text") return formatMockValue(type, field, row);
  const generated = generatedContent[field];
  return generated ? renderGeneratedValue(generated, row) : formatMockValue("text", field, row);
}
