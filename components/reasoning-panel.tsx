"use client";

import { motion } from "motion/react";
import type { Decision } from "@/lib/decide";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;
const STEP_MS = 30;

function Row({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      // The value side truncates rather than wrapping: these rows stay
      // scannable as label/value pairs even at ~320px, where several values
      // (entity names, style triplets) are wider than the space left over.
      className="flex items-center justify-between gap-3 [&>span:first-child]:shrink-0 [&>span:last-child]:truncate [&>span:last-child]:text-right"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: (index * STEP_MS) / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Bar({ label, value, index }: { label: string; value: number; index: number }) {
  const delay = (index * STEP_MS) / 1000;
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: EASE }}
    >
      <span className="w-20 shrink-0 truncate text-muted-foreground sm:w-32">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <motion.div
          className="h-1.5 rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.4, delay: delay + 0.08, ease: EASE }}
        />
      </div>
      <span className="w-10 shrink-0 text-right">{(value * 100).toFixed(0)}%</span>
    </motion.div>
  );
}

export function ReasoningPanel({ decision, bare = false }: { decision: Decision; bare?: boolean }) {
  const siblingProbs = Object.entries(decision.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const totalMs = decision.latencyMs.call1 + decision.latencyMs.call2 + (decision.latencyMs.call3 ?? 0) + (decision.latencyMs.compose ?? 0);

  let i = 0;

  return (
    <Card
      key={`${decision.componentId}-${decision.latencyMs.call1}`}
      // Card carries its outline as `ring-1`, not a border, so `bare` has to
      // clear the ring — `border-0` alone leaves the hairline visible.
      className={cn("w-full", bare ? "gap-0 bg-transparent py-0 ring-0" : "shadow-float border border-border/60")}
    >
      {/* In `bare` mode the surrounding sheet already carries this title. */}
      {!bare && (
        <CardHeader>
          <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            How Jev got here
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex flex-col gap-4 font-mono text-sm", bare && "px-0")}>
        <Row index={i++}>
          <span className="text-muted-foreground">{decision.kind === "block" ? "block" : "component"}</span>
          <span>{decision.label}</span>
        </Row>
        <Row index={i++}>
          <span className="text-muted-foreground">subject</span>
          <span className="max-w-[65%] truncate text-right">{decision.entity}</span>
        </Row>
        <Row index={i++}>
          <span className="text-muted-foreground">tone</span>
          <span>{decision.tone}</span>
        </Row>
        <Row index={i++}>
          <span className="text-muted-foreground">path</span>
          <span>{decision.path} · {totalMs}ms</span>
        </Row>
        <Row index={i++}>
          <span className="text-muted-foreground">style</span>
          <span>{decision.style.font} · {decision.style.theme} · {decision.style.density}</span>
        </Row>
        <Row index={i++}>
          <span className="text-muted-foreground">taste</span>
          <span>{decision.style.radius} · {decision.style.motion} · {decision.style.elevation}</span>
        </Row>
        <Row index={i++}>
          <span className="text-muted-foreground">icon</span>
          <span>{decision.style.icon}</span>
        </Row>
        {decision.composition && (
          <Row index={i++}>
            <span className="text-muted-foreground">composition</span>
            <span>{decision.composition.pattern}{decision.composition.heroField ? ` · hero: ${decision.composition.heroField}` : ""}</span>
          </Row>
        )}
        {decision.chartType && (
          <Row index={i++}>
            <span className="text-muted-foreground">chart type</span>
            <span>{decision.chartType}</span>
          </Row>
        )}

        {decision.kind === "block" ? (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-muted-foreground">block family: {decision.family}</span>
            {siblingProbs.map(([id, p]) => (
              <Bar key={id} label={id} value={p} index={i++} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <span className="text-muted-foreground">call 1 — family beam</span>
              {decision.beam.map((b) => (
                <Bar key={b.family} label={b.family} value={b.familyProbability} index={i++} />
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <span className="text-muted-foreground">
                {decision.path === "3-call"
                  ? "call 3 — tiebreak between the two beam leaders"
                  : `call 2 — within ${decision.family}`}
              </span>
              {siblingProbs.map(([id, p]) => (
                <Bar key={id} label={id} value={p} index={i++} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
