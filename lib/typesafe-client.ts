import "server-only";
import { TypeSafeClient } from "@typesafe-ai/sdk";

let sharedClient: TypeSafeClient | undefined;

/**
 * Constructed lazily: the SDK throws if `TYPESAFE_API_KEY` is missing, and eager
 * construction at module scope would fail Next's build-time page data collection
 * even when the key is only available at request time.
 *
 * A caller-supplied `apiKey` (a visitor spending their own credits past the free
 * quota, see `lib/rate-limit.ts`) always gets a fresh client — never the shared
 * one, so one visitor's key can't leak into another visitor's request.
 */
export function getTypesafeClient(apiKey?: string): TypeSafeClient {
  if (apiKey) return new TypeSafeClient({ apiKey });
  if (!sharedClient) sharedClient = new TypeSafeClient();
  return sharedClient;
}
