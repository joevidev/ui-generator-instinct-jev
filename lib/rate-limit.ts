/**
 * Free-quota accounting for the public demo. This exists to cap what the
 * repo owner's own API credits pay for, not as a security boundary: the
 * counter lives in a plain cookie, so clearing cookies resets it. Signing it
 * would add nothing — clearing defeats a signed cookie just as easily — so
 * it's deliberately kept simple and honest rather than security-theatre.
 *
 * Past the quota a visitor supplies their own TypeSafe key and spends their
 * own credits, which is the actual intended path for anyone cloning this.
 */
export const FREE_GENERATIONS = 5;
export const USAGE_COOKIE = "instinct_free_uses";

/** Sent as the response body on 429 so the client knows to ask for a key
 * rather than showing a generic failure. */
export interface QuotaError {
  error: "quota_exceeded";
  used: number;
  limit: number;
}

export function parseUsage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}
