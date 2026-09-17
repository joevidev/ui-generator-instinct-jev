"use client";

import { useInstinctStore } from "@/lib/store";
import { ReasoningPanel } from "@/components/reasoning-panel";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Card, CardContent } from "@/components/ui/card";

export function ReasoningRail() {
  const { current, status } = useInstinctStore();

  if (status === "loading") {
    return (
      <Card className="shadow-float w-full border border-border/60">
        <CardContent className="flex flex-col items-center gap-2 py-10">
          <Shimmer className="font-mono text-xs uppercase tracking-wider" duration={1.1}>
            Jev is reading the case…
          </Shimmer>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        Once Jev resolves a case, how it got there shows up here.
      </p>
    );
  }

  return <ReasoningPanel decision={current.decision} />;
}
