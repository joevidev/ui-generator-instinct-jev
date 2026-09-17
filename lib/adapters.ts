import type { Intake } from "./intake";
import type { FillKey } from "./families";
import type { FieldType } from "./field-types";
import { cellValue, type GeneratedField } from "./generated-content";
import { EMPHASIS_TEXT_SIZE, type CardComposition, type ChartType } from "./composition";

type Filled = Partial<Record<FillKey, unknown>>;
type FieldTypes = Record<string, FieldType>;
type Composition = { pattern: CardComposition; heroField: string | null; emphasis: number } | undefined;

function score01(filled: Filled, key: FillKey, fallback = 1): number {
  const v = filled[key];
  return typeof v === "number" ? v : fallback;
}

function bool(filled: Filled, key: FillKey, fallback = false): boolean {
  const v = filled[key];
  return typeof v === "number" ? v > 0.5 : fallback;
}

function withFallback(fields: string[], fallback: string[]): string[] {
  return fields.length > 0 ? fields : fallback;
}

const SIZE_BY_SCORE = ["sm", "default", "lg"] as const;

/**
 * Every component's content is selected from what the user already typed in the
 * structured intake, never generated. The eight `deep` components additionally use
 * the family fill answers Jev resolved in the same call, to decide structure
 * (variant, density, item count), not content. `fieldTypes` (value-extraction
 * discipline: code found the candidates, Jev only picked among them) drives the
 * one place synthetic sample values are shown — the table adapter — so rows read
 * as real currency/dates/emails instead of "field #1".
 */
export function adaptProps(
  componentId: string,
  intake: Intake,
  filled: Filled,
  fieldTypes: FieldTypes = {},
  composition?: Composition,
  chartType?: ChartType,
  generatedContent: Record<string, GeneratedField> = {}
): Record<string, unknown> {
  const fields = withFallback(intake.fields, ["First field", "Second field", "Third field"]);
  const entity = intake.entity || "Untitled case";

  switch (componentId) {
    case "button":
      return {
        variant: (filled.action_variant as string) ?? "default",
        size: SIZE_BY_SCORE[Math.round(score01(filled, "action_prominence", 1))] ?? "default",
        label: entity,
      };

    case "card": {
      const allStats = intake.fields.length > 0
        ? fields.slice(0, 4).map((f) => ({ label: f, value: cellValue(f, 0, fieldTypes, generatedContent) }))
        : [];
      const heroLabel = composition?.heroField ?? null;
      const hero = heroLabel ? allStats.find((s) => s.label === heroLabel) : undefined;
      const secondary = hero ? allStats.filter((s) => s.label !== heroLabel) : allStats;
      return {
        title: entity,
        description: intake.case || "No case provided yet.",
        pattern: composition?.pattern ?? "equal-grid",
        heroTextSize: EMPHASIS_TEXT_SIZE[composition?.emphasis ?? 0] ?? EMPHASIS_TEXT_SIZE[0],
        hero: hero ?? null,
        stats: secondary,
      };
    }

    case "table": {
      const dense = score01(filled, "data_density", 1) >= 1.5;
      const withActions = bool(filled, "data_needs_action");
      const rowCount = dense ? 5 : 3;
      return {
        columns: fields,
        withActions,
        caption: `${rowCount} ${entity.toLowerCase()}`,
        rows: Array.from({ length: rowCount }, (_, i) =>
          fields.map((f) => cellValue(f, i, fieldTypes, generatedContent))
        ),
      };
    }

    case "select":
      return {
        placeholder: `Choose ${entity}`,
        options: withFallback(fields, ["Option A", "Option B", "Option C"]).slice(0, 6),
        required: bool(filled, "input_required"),
      };

    case "tabs": {
      const tabs = withFallback(fields, ["Overview", "Details"]).slice(0, 6);
      return { tabs, entity };
    }

    case "alert":
      return {
        variant: (filled.feedback_kind as string) ?? "default",
        title: entity,
        description: intake.case || "No case provided yet.",
      };

    case "dialog":
      return {
        destructive: bool(filled, "overlay_destructive"),
        title: `Confirm ${entity}`,
        description: intake.case || "This will apply to your case.",
      };

    case "accordion": {
      const count = score01(filled, "layout_item_count", 1) >= 1.5 ? 5 : 3;
      const items = withFallback(fields, ["First item", "Second item", "Third item"]).slice(0, count);
      return {
        multiple: !bool(filled, "layout_exclusive"),
        items: items.map((title) => ({
          title,
          content: intake.case || "No case provided yet.",
        })),
      };
    }

    // Generic fallback: selected from the intake directly, no fill questions needed.
    case "badge":
      return { label: entity, variant: intake.tone === "formal" ? "outline" : intake.tone === "playful" ? "default" : "secondary" };
    case "avatar":
      return { initials: entity.slice(0, 2).toUpperCase() || "??" };
    case "input":
      return { placeholder: fields[0] ?? entity };
    case "checkbox":
      return { items: fields.slice(0, 6) };
    case "switch":
      return { items: fields.slice(0, 4) };
    case "textarea":
      return { value: intake.case, placeholder: `Describe ${entity}` };
    case "breadcrumb":
      return { crumbs: ["Home", entity, ...fields.slice(0, 2)] };
    case "pagination":
      return { pageCount: Math.max(3, Math.min(fields.length || 5, 9)) };
    case "progress":
      return { value: intake.tone === "playful" ? 85 : 60, label: entity };
    case "skeleton":
      return { lines: Math.max(2, Math.min(fields.length || 3, 6)) };
    case "sheet":
      return { trigger: entity, title: entity, description: intake.case };
    case "popover":
      return { trigger: entity, content: intake.case || entity };
    case "tooltip":
      return { trigger: entity, content: intake.case.slice(0, 80) || entity };
    case "dropdown-menu":
      return { trigger: entity, items: withFallback(fields, ["Edit", "Duplicate", "Delete"]).slice(0, 6) };
    case "separator":
      return { label: entity };

    case "button-group": {
      const variant = (filled.action_variant as string) ?? "default";
      return {
        variant,
        actions: withFallback(fields, ["Edit", "Duplicate", "Delete"]).slice(0, 4),
      };
    }

    case "carousel": {
      const count = score01(filled, "data_density", 1) >= 1.5 ? 5 : 3;
      return { items: withFallback(fields, ["Slide 1", "Slide 2", "Slide 3"]).slice(0, count) };
    }

    case "chart": {
      const isSliceType = chartType === "pie" || chartType === "donut";
      const points = isSliceType ? 4 : score01(filled, "data_density", 1) >= 1.5 ? 7 : 4;
      const label = fields[0] ?? entity;
      return {
        label,
        chartType: chartType ?? "bar",
        data: Array.from({ length: points }, (_, i) => ({
          label: `#${i + 1}`,
          value: 20 + Math.round(Math.sin(i + fields.length) * 20 + 30),
        })),
      };
    }

    case "item": {
      const withActions = bool(filled, "data_needs_action");
      const count = score01(filled, "data_density", 1) >= 1.5 ? 4 : 2;
      return {
        withActions,
        items: withFallback(fields, ["First item", "Second item"]).slice(0, count),
      };
    }

    case "empty":
      return { title: `No ${entity} yet`, description: intake.case || "Nothing to show here yet." };

    case "aspect-ratio":
      return { label: entity };

    case "combobox":
      return {
        placeholder: `Search ${entity}`,
        options: withFallback(fields, ["Option A", "Option B", "Option C"]).slice(0, 8),
      };

    case "radio-group": {
      const count = score01(filled, "input_option_count", 1) >= 1.5 ? 5 : 3;
      return {
        options: withFallback(fields, ["Option A", "Option B"]).slice(0, count),
        required: bool(filled, "input_required"),
      };
    }

    case "slider":
      return { label: fields[0] ?? entity };

    case "toggle":
      return { label: fields[0] ?? entity };

    case "toggle-group":
      return { options: withFallback(fields, ["List", "Grid", "Board"]).slice(0, 4) };

    case "input-group":
      return { placeholder: fields[0] ?? entity, prefix: (fieldTypes[fields[0]] ?? "text") === "currency" ? "$" : undefined };

    case "input-otp":
      return { length: 6 };

    case "field":
      return {
        label: fields[0] ?? entity,
        description: intake.case.slice(0, 80) || `Enter ${entity}`,
      };

    case "calendar":
      return { label: entity };

    case "command": {
      const count = score01(filled, "nav_section_count", 1) >= 1.5 ? 6 : 4;
      return { items: withFallback(fields, ["Go to Overview", "Go to Settings"]).slice(0, count) };
    }

    case "navigation-menu":
      return { items: withFallback(fields, ["Overview", "Details"]).slice(0, 5) };

    case "menubar":
      return { menus: withFallback(fields, ["File", "Edit", "View"]).slice(0, 5) };

    case "alert-dialog":
      return {
        destructive: bool(filled, "overlay_destructive"),
        title: `Confirm ${entity}`,
        description: intake.case || "This will apply to your case.",
      };

    case "drawer":
      return { trigger: entity, title: entity, description: intake.case };

    case "context-menu":
      return { trigger: entity, items: withFallback(fields, ["Edit", "Duplicate", "Delete"]).slice(0, 6) };

    case "hover-card":
      return { trigger: entity, content: intake.case || entity };

    case "collapsible":
      return { label: fields[0] ?? entity, content: intake.case || "No case provided yet." };

    case "scroll-area":
      return { items: withFallback(fields, ["First field", "Second field", "Third field"]).slice(0, 8) };

    case "resizable": {
      const count = score01(filled, "layout_item_count", 1) >= 1.5 ? 3 : 2;
      return { panels: withFallback(fields, ["Panel A", "Panel B"]).slice(0, count) };
    }

    default:
      return { label: entity };
  }
}
