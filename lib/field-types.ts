/**
 * Value-extraction discipline: code never pre-filters which type a field
 * "sounds like" — that was English-only regex matching in disguise, the same
 * bug class as the early Spanish weather-card entity/icon bug. Jev always
 * sees the full real type taxonomy and picks with its own (multilingual)
 * judgment, for every field, in every language.
 */
export type FieldType = "currency" | "date" | "email" | "number" | "boolean" | "text";

export const FIELD_TYPE_DESCRIPTIONS: Record<FieldType, string> = {
  currency: "a monetary amount, price, or cost",
  date: "a calendar date, deadline, or timestamp",
  email: "an email address",
  number: "a plain count, quantity, age, or rating with no currency or date meaning",
  boolean: "a yes/no, true/false, or on/off state",
  text: "free-form text: a name, status, title, or label that isn't a date, money, email, or yes/no",
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMockValue(type: FieldType, field: string, index: number): string {
  switch (type) {
    case "currency":
      return CURRENCY_FORMATTER.format(120 + index * 137.5);
    case "date": {
      const d = new Date();
      d.setDate(d.getDate() + index * 3);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    case "email":
      return `user${index + 1}@example.com`;
    case "number":
      return String(10 + index * 7);
    case "boolean":
      return index % 2 === 0 ? "Yes" : "No";
    case "text":
    default:
      return `${field} #${index + 1}`;
  }
}
