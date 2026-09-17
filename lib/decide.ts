import "server-only";
import { choice, noul, score, type ChoiceResponse, type NoulResponse, type ScoreResponse } from "@typesafe-ai/sdk";
import { getTypesafeClient } from "./typesafe-client";
import { CATALOG, FAMILY_MEMBERS, FAMILY_DESCRIPTIONS, familyOf, type Family } from "./catalog";
import { FAMILY_FILL_KEYS, FILL_QUESTIONS, buildLeafChoice, type FillKey } from "./families";
import { FIELD_TYPE_DESCRIPTIONS, type FieldType } from "./field-types";
import { entityCandidates, fieldSpanCandidates, ICON_CATALOG } from "./extract";
import { buildContentQuestions, resolveGeneratedFields, cellValue, type GeneratedField } from "./generated-content";
import { CARD_COMPOSITIONS, COMPOSITION_ELIGIBLE, EMPHASIS_LEVELS, CHART_TYPES, type CardComposition, type ChartType } from "./composition";
import {
  FONT_PRESETS,
  THEME_PRESETS,
  DENSITY_LEVELS,
  DENSITY_BY_SCORE,
  RADIUS_PRESETS,
  MOTION_PRESETS,
  ELEVATION_PRESETS,
  type FontPreset,
  type ThemePreset,
  type Density,
  type Radius,
  type Motion,
  type Elevation,
} from "./style-presets";
import type { Intake, RawInput, Tone } from "./intake";
import { adaptProps } from "./adapters";
import { BLOCK_CATALOG, BLOCK_FAMILY_MEMBERS, BLOCK_FAMILY_DESCRIPTIONS, type BlockFamily } from "./blocks";
import { adaptSidebarProps, adaptAuthProps } from "./block-adapters";

export interface BeamCandidate {
  family: Family;
  familyProbability: number;
  leafId: string;
  leafConfidence: number;
  composite: number;
}

export interface Decision {
  kind: "atomic" | "block";
  componentId: string;
  family: string;
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
  filled: Partial<Record<FillKey, unknown>>;
  fieldTypes: Record<string, FieldType>;
  props: Record<string, unknown>;
  entity: string;
  tone: Tone;
  style: { font: FontPreset; theme: ThemePreset; density: Density; radius: Radius; motion: Motion; elevation: Elevation; icon: string };
  path: "2-call" | "3-call";
  composition?: { pattern: CardComposition; heroField: string | null; emphasis: number };
  chartType?: ChartType;
  beam: BeamCandidate[];
  latencyMs: { call1: number; call2: number; call3?: number; compose?: number; content?: number };
  usage: { input_tokens: number; output_tokens: number };
}

function buildBlockLeafChoice(family: BlockFamily) {
  const members = BLOCK_FAMILY_MEMBERS[family];
  return choice(
    `Within the "${family}" block family, which specific real shadcn block fits this case?`,
    Object.fromEntries(members.map((m) => [m.id, m.description]))
  );
}

const ESCALATE_MARGIN = 0.15;
const ESCALATE_CONFIDENCE = 0.55;

const RELEVANCE_LEVELS = [
  "not a real field, just an incidental word or a description of what a chart, table, or section is about",
  "possibly a field, but ambiguous",
  "clearly one of the actual structured data fields or columns this case needs",
] as const;
const RELEVANCE_MIN_SCORE = 1;
const MAX_FIELDS = 4;
const MAX_TEXT_CONTENT_FIELDS = 3;

function addUsage(a: { input_tokens: number; output_tokens: number }, b: { input_tokens: number; output_tokens: number }) {
  a.input_tokens += b.input_tokens;
  a.output_tokens += b.output_tokens;
}

/**
 * Four-stage hierarchical decision, chained only as far as needed:
 *  0. code-only extraction: entity/field/icon candidates from the raw text
 *     (lib/extract.ts), no model call, just pattern matching
 *  1. family (7-way, easy) + fill for all families (speculative) + field
 *     typing + entity/tone/icon selection among the extracted candidates
 *  2. leaf-within-family for the top-2 families by probability (beam width 2)
 *  3. only if the winner is ambiguous: a direct head-to-head tiebreak
 */
export async function decide(input: RawInput): Promise<Decision> {
  const client = getTypesafeClient();
  const usage = { input_tokens: 0, output_tokens: 0 };
  const text = input.text;
  const state = { text };

  const entities = entityCandidates(text);
  const fieldSpans = fieldSpanCandidates(text);

  // Every span is a candidate; Jev's judgment decides which are actually
  // relevant data fields, code never pre-filters by English keyword matching
  // (that silently only worked for one language, see lib/extract.ts). Score,
  // not Noul: a per-span yes/no can't tell "revenue" (describing what a
  // chart is about) apart from "amount" (an explicit column after "with"),
  // because each span was judged in isolation. Naming every other candidate
  // in the question gives Jev the same relative context a person would use,
  // and ranking by score (not thresholding each in isolation) is what
  // actually resolves the ambiguity.
  const fieldRelevanceQuestions = Object.fromEntries(
    fieldSpans.map((f, i) => [
      `field_relevant__${i}`,
      score(
        `This case mentions these candidate words or phrases: ${fieldSpans.map((s) => `"${s}"`).join(", ")}. Relative to the others, how strongly is "${f}" specifically one of the actual structured data fields or columns this case needs to show or collect — as opposed to a word that just names what a chart, table, list, or section is about, or an otherwise incidental word?`,
        RELEVANCE_LEVELS
      ),
    ])
  );
  const fieldTypeQuestions = Object.fromEntries(
    fieldSpans.map((f, i) => [`field_type__${i}`, choice(`What kind of value is the "${f}" field?`, FIELD_TYPE_DESCRIPTIONS)])
  );

  const call1Start = Date.now();
  const call1 = await client.systemOne({
    state,
    questions: {
      scope: noul("Does this case need a complete page section (a full dashboard layout with navigation, or a full login or signup page), rather than a single UI piece?"),
      block_family: choice("If this needs a full page section, which kind?", BLOCK_FAMILY_DESCRIPTIONS),
      block_leaf_in_dashboard: buildBlockLeafChoice("dashboard"),
      block_leaf_in_authentication: buildBlockLeafChoice("authentication"),
      family: choice("Which category of UI component best fits this case?", FAMILY_DESCRIPTIONS),
      entity_pick: choice("Which of these is the main subject of this case?", Object.fromEntries(entities.map((e) => [e, null]))),
      tone_pick: choice("What tone does this case call for?", {
        neutral: "plain, businesslike, no strong personality",
        playful: "light, fun, informal",
        formal: "serious, precise, professional",
      }),
      style_icon: choice("Which icon best represents the subject of this case, regardless of what language the case is written in?", ICON_CATALOG),
      style_font: choice("Which font pairing fits the feel of this case?", FONT_PRESETS),
      style_theme: choice("Which color theme fits the feel of this case?", THEME_PRESETS),
      style_density: score("How much visual breathing room does this case call for?", DENSITY_LEVELS),
      style_radius: choice("What corner-shape personality fits this case?", RADIUS_PRESETS),
      style_motion: choice("How much entrance motion does resolving this case deserve?", MOTION_PRESETS),
      style_elevation: choice("How much visual weight or lift should this case have?", ELEVATION_PRESETS),
      ...FILL_QUESTIONS,
      ...fieldRelevanceQuestions,
      ...fieldTypeQuestions,
    },
  });
  const latencyMs: Decision["latencyMs"] = { call1: Date.now() - call1Start, call2: 0 };
  addUsage(usage, call1.usage);

  const call1Answers = call1.answers as unknown as Record<string, ChoiceResponse>;
  const familyAnswer = call1Answers.family;
  const beamFamilies = (Object.entries(familyAnswer.probabilities) as [Family, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const call1ScoreAnswers = call1.answers as unknown as Record<string, ScoreResponse>;
  const fields = fieldSpans
    .map((f, i) => ({ f, score: call1ScoreAnswers[`field_relevant__${i}`]?.score ?? 0 }))
    .filter((x) => x.score > RELEVANCE_MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_FIELDS)
    .map((x) => x.f);

  const fieldTypes: Record<string, FieldType> = {};
  fieldSpans.forEach((f, i) => {
    if (!fields.includes(f)) return;
    const answer = call1Answers[`field_type__${i}`];
    if (answer) fieldTypes[f] = answer.choice as FieldType;
  });

  const entity = call1Answers.entity_pick.choice;
  const tone = call1Answers.tone_pick.choice as Tone;
  const icon = call1Answers.style_icon.choice;

  const densityScore = call1.answers.style_density as unknown as ScoreResponse;
  const style = {
    font: call1Answers.style_font.choice as FontPreset,
    theme: call1Answers.style_theme.choice as ThemePreset,
    density: DENSITY_BY_SCORE[Math.round(densityScore.score)] ?? "comfortable",
    radius: call1Answers.style_radius.choice as Radius,
    motion: call1Answers.style_motion.choice as Motion,
    elevation: call1Answers.style_elevation.choice as Elevation,
    icon,
  };

  // Resolved shape lib/families.ts and lib/adapters.ts already expect;
  // `case` is the raw text, it needed no extraction.
  const intake: Intake = { case: text, entity, fields, tone };

  // Chained word selection, fanned out: for each text-type field that needs
  // a sample value, Jev picks a category (name / status / label) and the
  // word(s) for it via Choice — never free text. The label category chains
  // for real: every possible second word is asked conditioned on every
  // possible first word in the same call, so composing two words costs no
  // extra round trip, only extra tokens (the same "parallelism is free"
  // principle every other axis in this app already uses).
  async function generateContent(textFields: string[]): Promise<Record<string, GeneratedField>> {
    if (textFields.length === 0) return {};
    const contentStart = Date.now();
    const contentCall = await client.systemOne({
      state,
      questions: buildContentQuestions(textFields),
    });
    latencyMs.content = Date.now() - contentStart;
    addUsage(usage, contentCall.usage);
    return resolveGeneratedFields(textFields, contentCall.answers as unknown as Record<string, ChoiceResponse>);
  }

  // Block gate: a full page section, not a single UI piece. Deliberately
  // simpler than the atomic path (no beam, no cascade, no compose stage):
  // only 2 families and 17 leaves total, small enough that the family and
  // leaf choices already asked speculatively above are enough on their own.
  const scopeAnswer = call1.answers.scope as unknown as NoulResponse;
  if (scopeAnswer.noul > 0.5) {
    const blockFamilyAnswer = call1Answers.block_family as unknown as ChoiceResponse;
    const blockFamily = blockFamilyAnswer.choice as BlockFamily;
    const leafAnswer = call1Answers[`block_leaf_in_${blockFamily}`] as unknown as ChoiceResponse;
    const blockId = leafAnswer.choice;
    const blockEntry = BLOCK_CATALOG.find((b) => b.id === blockId);

    const dashboardTextFields =
      blockId === "dashboard-01" ? fields.filter((f) => fieldTypes[f] === "text").slice(0, MAX_TEXT_CONTENT_FIELDS) : [];
    const dashboardContent = await generateContent(dashboardTextFields);
    const dashboardColumns = fields.length > 0 ? fields : ["name", "status", "amount"];

    const blockProps =
      blockFamily === "authentication"
        ? adaptAuthProps(blockId, intake)
        : blockId === "dashboard-01"
          ? {
              sidebar: adaptSidebarProps(blockId, intake),
              stats: fields.slice(0, 3).map((f, i) => ({ label: f, value: cellValue(f, i, fieldTypes, dashboardContent) })),
              columns: dashboardColumns,
              rows: Array.from({ length: 5 }, (_, i) => dashboardColumns.map((f) => cellValue(f, i, fieldTypes, dashboardContent))),
            }
          : adaptSidebarProps(blockId, intake);

    return {
      kind: "block",
      componentId: blockId,
      family: blockFamily,
      label: blockEntry?.label ?? blockId,
      confidence: leafAnswer.confidence,
      probabilities: leafAnswer.probabilities,
      filled: {},
      fieldTypes,
      props: blockProps as unknown as Record<string, unknown>,
      entity,
      tone,
      style,
      path: "2-call",
      beam: [],
      latencyMs,
      usage,
    };
  }

  const call2Start = Date.now();
  const call2 = await client.systemOne({
    state,
    questions: Object.fromEntries(
      beamFamilies.map(([family]) => [`leaf_in_${family}`, buildLeafChoice(family, FAMILY_MEMBERS[family])])
    ),
  });
  latencyMs.call2 = Date.now() - call2Start;
  addUsage(usage, call2.usage);

  const beam: BeamCandidate[] = beamFamilies.map(([family, familyProbability]) => {
    const answer = call2.answers[`leaf_in_${family}`] as unknown as ChoiceResponse;
    return {
      family,
      familyProbability,
      leafId: answer.choice,
      leafConfidence: answer.confidence,
      composite: familyProbability * answer.confidence,
    };
  });
  beam.sort((a, b) => b.composite - a.composite);

  const [winner, runnerUp] = beam;
  let finalId = winner.leafId;
  let finalConfidence = winner.leafConfidence;
  let finalProbabilities: Record<string, number> = (call2.answers[`leaf_in_${winner.family}`] as unknown as ChoiceResponse).probabilities;
  let path: Decision["path"] = "2-call";

  const shouldEscalate =
    runnerUp && (winner.composite - runnerUp.composite < ESCALATE_MARGIN || winner.leafConfidence < ESCALATE_CONFIDENCE);

  if (shouldEscalate) {
    const winnerEntry = CATALOG.find((c) => c.id === winner.leafId)!;
    const runnerEntry = CATALOG.find((c) => c.id === runnerUp.leafId)!;
    const call3Start = Date.now();
    const call3 = await client.systemOne({
      state: {
        ...state,
        candidate_a: `${winnerEntry.label}: ${winnerEntry.description}`,
        candidate_b: `${runnerEntry.label}: ${runnerEntry.description}`,
      },
      questions: {
        tiebreak: choice("Between exactly these two candidates, which is the better fit for this case?", {
          [winnerEntry.id]: `Candidate A: ${winnerEntry.description}`,
          [runnerEntry.id]: `Candidate B: ${runnerEntry.description}`,
        }),
      },
    });
    latencyMs.call3 = Date.now() - call3Start;
    addUsage(usage, call3.usage);

    const tiebreak = call3.answers.tiebreak as unknown as ChoiceResponse;
    finalId = tiebreak.choice;
    finalConfidence = tiebreak.confidence;
    finalProbabilities = tiebreak.probabilities;
    path = "3-call";
  }

  const entry = CATALOG.find((c) => c.id === finalId);
  const family = familyOf(finalId) ?? beam[0].family;

  const relevantKeys = FAMILY_FILL_KEYS[family] ?? [];
  const filled: Partial<Record<FillKey, unknown>> = {};
  for (const key of relevantKeys) {
    const answer = call1.answers[key];
    if (!answer) continue;
    if (answer.type === "choice") filled[key] = answer.choice;
    else if (answer.type === "noul") filled[key] = answer.noul;
    else if (answer.type === "score") filled[key] = answer.score;
  }

  // A modular design-thinking stage, not a style axis: only fires for
  // components whose internal layout genuinely varies, so the common case
  // (table, select, alert, ...) never pays for it. Noul decides whether real
  // hierarchy exists at all, Score how strong it is, Choice which pattern
  // and which fact carries it, three separate judgments in one extra call.
  let composition: Decision["composition"];
  if (COMPOSITION_ELIGIBLE.has(finalId) && fields.length > 0) {
    const composeStart = Date.now();
    const composeCall = await client.systemOne({
      state: { ...state, entity, fields },
      questions: {
        needs_hero: noul("Does one single fact here deserve clearly more visual weight than the others, or are they genuinely equal in importance?"),
        hero_emphasis: score("If one fact stands out, how much more emphasis should it get?", EMPHASIS_LEVELS),
        pattern: choice("Which layout pattern fits how these facts relate to each other?", CARD_COMPOSITIONS),
        hero_field: choice("If one fact should stand out, which is it?", Object.fromEntries([...fields.map((f) => [f, null]), ["none", "no single fact stands out"]])),
      },
    });
    latencyMs.compose = Date.now() - composeStart;
    addUsage(usage, composeCall.usage);

    const composeAnswers = composeCall.answers as unknown as {
      needs_hero: NoulResponse;
      hero_emphasis: ScoreResponse;
      pattern: ChoiceResponse;
      hero_field: ChoiceResponse;
    };
    const hasHero = composeAnswers.needs_hero.noul > 0.5;
    composition = {
      pattern: composeAnswers.pattern.choice as CardComposition,
      heroField: hasHero && composeAnswers.hero_field.choice !== "none" ? composeAnswers.hero_field.choice : null,
      emphasis: Math.round(composeAnswers.hero_emphasis.score),
    };
  }

  let chartType: ChartType | undefined;
  if (finalId === "chart") {
    const composeStart = Date.now();
    const chartCall = await client.systemOne({
      state: { ...state, entity },
      questions: {
        chart_type: choice("Which chart type fits what this case needs to show?", CHART_TYPES),
      },
    });
    latencyMs.compose = Date.now() - composeStart;
    addUsage(usage, chartCall.usage);
    chartType = (chartCall.answers.chart_type as unknown as ChoiceResponse).choice as ChartType;
  }

  const atomicTextFields =
    finalId === "table" || finalId === "card" ? fields.filter((f) => fieldTypes[f] === "text").slice(0, MAX_TEXT_CONTENT_FIELDS) : [];
  const generatedContent = await generateContent(atomicTextFields);

  return {
    kind: "atomic",
    componentId: finalId,
    family,
    label: entry?.label ?? finalId,
    confidence: finalConfidence,
    probabilities: finalProbabilities,
    filled,
    fieldTypes,
    props: adaptProps(finalId, intake, filled, fieldTypes, composition, chartType, generatedContent),
    entity,
    tone,
    style,
    path,
    composition,
    chartType,
    beam,
    latencyMs,
    usage,
  };
}
