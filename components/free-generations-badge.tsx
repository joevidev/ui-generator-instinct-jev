"use client";

import { useEffect } from "react";
import { useInstinctStore } from "@/lib/store";
import { FREE_GENERATIONS } from "@/lib/rate-limit";

/** How many of the shared demo's free generations the visitor has left.
 * Hidden when they bring their own key, since that spend isn't metered. */
export function FreeGenerationsBadge() {
  const { freeRemaining, apiKey, loadQuota } = useInstinctStore();

  useEffect(() => {
    loadQuota();
  }, [loadQuota]);

  if (apiKey.length > 0 || freeRemaining === null) return null;

  return (
    <div className="mx-auto">
      <span
        role="status"
        className="shadow-float rounded-full border border-border/60 bg-card/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-md"
      >
        {freeRemaining} of {FREE_GENERATIONS} free generations left
      </span>
    </div>
  );
}
