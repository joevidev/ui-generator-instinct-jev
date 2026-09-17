# Instinct

**Describe it. Jev decides.** A demo of [Jev](https://typesafe.ai) — TypeSafe's "System One" model — as a UI generator. You describe a case in free text; Jev never generates a line of code or copy back. It only ever answers typed questions (`Choice`, `Noul`, `Score`) over bounded, real option sets, and the app renders whichever real [shadcn/ui](https://ui.shadcn.com) component (or full page block) it picked, configured the way it decided.

Content artifact for a Buivo post about System One models. Working name, pending final brand sign-off.

## The idea

Every other "AI UI generator" asks a model to write code or copy and hopes it's syntactically valid and on-brand. Jev is a different kind of model: it never free-text generates anything on the decision path. It answers three kinds of typed questions —

- **`Choice`** — pick exactly one option from a named, bounded set, with a full probability distribution over every option
- **`Noul`** — a graded yes/no
- **`Score`** — a graded rank along a described scale

— and that's it. Instinct exists to prove that's enough to go from "a customer table with name, status, and plan" to a real, correctly-typed, on-brand React component, with zero free text anywhere in the pipeline except the user's own input.

## Stack

Next.js 16 (App Router, Turbopack), Tailwind v4, shadcn/ui (Base UI primitives, Nova preset), Hono (mounted at `app/api/[[...route]]/route.ts`), zustand (with `persist`), `@typesafe-ai/sdk`, recharts, Motion, Embla Carousel. Package manager: pnpm.

## Run it

```bash
pnpm install
cp .env.example .env.local   # fill in TYPESAFE_API_KEY
pnpm dev
```

Open `http://localhost:3000`. Without `TYPESAFE_API_KEY` set (or without remaining API credits), submitting a case returns a clean "Request failed: 500" — the real error path, not a mocked one.

## Bring your own key (free quota)

If you deploy this publicly, the key in `.env.local` pays for every visitor. So the first **5 generations** per visitor come out of that shared key; after that the UI asks for the visitor's own key from [console.typesafe.ai](https://console.typesafe.ai) and every further call is billed to them (`lib/rate-limit.ts`, `app/api/[[...route]]/route.ts`).

Details worth knowing:

- The visitor's key is kept in their browser's `localStorage` and sent per request. It is never written to disk or logged server-side, and a caller-supplied key always gets a fresh SDK client so it can't leak into another visitor's request (`lib/typesafe-client.ts`).
- Calls made with a visitor's own key are **not** metered — only the shared key is.
- Failed calls don't consume quota. The counter only increments on a successful decision, so a bad key or an out-of-credits account doesn't cost a generation the visitor never got.
- **This is a cost cap, not a security boundary.** The counter is a plain cookie, so clearing cookies resets it. Signing it would add nothing, since clearing defeats a signed cookie just as easily. If you need real enforcement, put a per-IP or per-account limit in front of the route.

## How a decision is made

See `lib/decide.ts`. Code never decides anything about the case itself — it only ever proposes bounded *candidates* (entity/field/icon spans in `lib/extract.ts`) for Jev to pick among. The pipeline is hierarchical and escalates only as far as it needs to:

1. **Call 1** — one request, speculative fan-out (parallelism costs tokens, not latency, so it asks everything that *might* be needed): a `Noul` gate for whether this needs a full page section instead of one component; a 7-way family `Choice` plus every family's structural fill questions (`lib/families.ts`); per-candidate-field relevance `Score` and type `Choice` (`lib/field-types.ts`); three style `Choice`/`Score` questions (font, theme, density) and three taste questions (radius, motion, elevation) from `lib/style-presets.ts`; and the block family/leaf choices in case the gate fires.
2. **Call 2** — beam width 2: a `Choice` within each of the top-2 families by probability, over just that family's members instead of a flat 48-way pick. `familyProbability × leafConfidence` composite scoring picks the winner. Blocks skip this — only 2 block families and 17 leaves total, small enough to resolve in call 1 alone.
3. **Call 3 (conditional)** — only when the winner's margin over the runner-up is thin or its own confidence is low: a direct head-to-head `Choice` between exactly those two candidates. Most cases stay at 2 calls.
4. **Compose (conditional)** — components whose internal layout genuinely varies get one more call: Card's layout pattern and hero field (`Noul` for whether real hierarchy exists → `Score` for how strong → `Choice` for which pattern and which field carries it), or Chart's type (bar/line/area/pie/donut).
5. **Content (conditional)** — see "Generated content" below.

`lib/adapters.ts` turns the resolved answers into real component props. Content is selected from the user's own intake wherever it exists; where it doesn't, see below.

## The catalog

`lib/catalog.ts` — 48 real shadcn components across 7 families, sourced from `pnpm dlx shadcn search @shadcn`, not curated by hand. 16 have bespoke fill questions and adapters (`deep: true`); the rest render straight from the intake but are still fully part of the routing decision.

`lib/blocks.ts` — 17 real shadcn *blocks* (full page sections): `dashboard-01`, 10 sidebar variants, and 6 authentication layouts. The 10 sidebar variants aren't 10 separate implementations — they're the same real `Sidebar` primitive differing by real, verified props (`variant`, `collapsible`, menu structure), the same discipline as the 48-component catalog.

## Generated content, not placeholder strings

Table cells and card stats used to read `"customer #1"`, `"status #1"`. Two problems, both fixed:

1. **Field over-extraction.** A per-span `Noul` ("is this a field?") judged every candidate in isolation, so it couldn't tell "revenue" (describing what a *chart* is about) apart from "amount" (an explicit column). The question now embeds every other candidate for contrast and uses `Score` instead, ranked and capped at the top 4 — not a per-item threshold.
2. **Placeholder content.** For fields Jev types as free-form text, `lib/generated-content.ts` asks it to pick a *category* (person's name / status / short label) and then the actual word(s) for it — via `Choice` over small, real, curated word banks (`lib/copy-bank.ts`), never free text. The two-word "label" category chains for real: the second-word question names the first word it would follow, and every possible first word's continuation is asked in the same call (fan-out), so composing two words costs no extra round trip. Row 0 is exactly what Jev picked; further rows vary deterministically through the same real vocabulary, rather than asking Jev again per row (which would multiply the call's cost by the row count).

This call only fires when there's a relevant text-typed field to fill (bounded to 3 fields), so it doesn't inflate the cost of the common case.

## Style and taste

Six more `Choice`/`Score` questions in call 1 pick a font pairing, color theme, density, corner radius, motion level, and elevation from small fixed sets (`lib/style-presets.ts`), applied via `data-*` attributes scoped to the render wrapper only (`components/canvas-panel.tsx`) — the app's own chrome stays neutral, only Jev's output gets art-directed.

## The Code view

Every resolved case has a Code toggle showing real, copy-pasteable JSX — not a hand-written template per catalog case (that would drift the moment the renderer changes) and not a JSON dump either. `lib/element-to-jsx.ts` walks the *actual React element tree* `Render`/`BlockRender` produce, and serializes it: real tag names (resolved from the exact import bindings `components/canvas-panel.tsx` already uses, not a component's own possibly-misleading runtime name — recharts' `Tooltip` is really imported as `ChartTooltip` from `@/components/ui/chart`, and the serializer gets that right), real props, real nested elements (including Base UI's `render={<Button />}` prop pattern), with the correct `import` lines attached automatically.

## Interface

Three floating layers over a full-viewport-centered canvas (`app/page.tsx`): a compact history list (left), the rendered case with a Code switch (center), and "how Jev got here" — the resolved family/leaf probabilities, style, and timing (right). The composer floats at the bottom center with a row of example-case suggestions (a real shadcn `Carousel`, not a static grid) shown until the first case resolves.

## Verified, not assumed

`tsc --noEmit`, `next build`, and `eslint` all pass. Verified live against the real Jev API repeatedly across atomic components, blocks, the escalation path (call 3 tiebreaks), the compose path (card patterns, chart types), and the content-generation path (real cycling names/statuses in a 5-row table). Not every one of the 48 catalog entries has been individually screenshot-checked; the generic (non-`deep`) ones are typechecked and code-reviewed against the actual installed shadcn source but not all visually spot-checked.

## Known limitations

- **Overlapping candidates still slip through occasionally.** "a pricing table with monthly price" can resolve to two nearly-identical columns (`price`, `monthly`) since both genuinely look like a real field on their own — the relevance fix ranks and caps, it doesn't merge near-duplicates.
- **The content-generation word banks are small and English.** `lib/copy-bank.ts` has ~5–6 entries per category; category *selection* is multilingual (Jev's own judgment), but the words themselves are a fixed English set.
- **`app/api/flavor/route.ts` is currently unused.** It calls Claude directly for a cosmetic empty-state line, deliberately isolated from the decision path — but nothing in the current UI calls it. Either wire it in or remove it before treating this as a finished reference.
- **Field/entity extraction is still English-agnostic pattern matching (spans and windows), not linguistic parsing.** It proposes candidates for Jev to pick among rather than trying to be correct on its own, by design, but a badly-phrased case can still starve Jev of a good candidate to pick.
