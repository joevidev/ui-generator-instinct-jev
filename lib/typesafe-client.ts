import "server-only";
import { TypeSafeClient } from "@typesafe-ai/sdk";

let client: TypeSafeClient | undefined;

/** Constructed lazily: the SDK throws if `TYPESAFE_API_KEY` is missing, and eager
 * construction at module scope would fail Next's build-time page data collection
 * even when the key is only available at request time. */
export function getTypesafeClient(): TypeSafeClient {
  if (!client) client = new TypeSafeClient();
  return client;
}
