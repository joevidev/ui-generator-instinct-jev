"use client";

import { useState } from "react";
import { useInstinctStore } from "@/lib/store";
import { HistoryRail } from "@/components/history-rail";
import { ReasoningRail } from "@/components/reasoning-rail";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { History, Sigma } from "lucide-react";

const PILL =
  "flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-card/95 px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-md transition-colors active:bg-accent disabled:opacity-40";

/**
 * The narrow-screen stand-in for the two floating rails. Both are reference
 * material, never the main surface, so they belong behind a tap here rather
 * than stacked above the canvas where they'd push the artifact off-screen.
 */
export function RailDrawers() {
  const { history, current } = useInstinctStore();
  const [openRail, setOpenRail] = useState<"history" | "reasoning" | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Drawer
        open={openRail === "history"}
        onOpenChange={(open) => setOpenRail(open ? "history" : null)}
        showSwipeHandle
      >
        <DrawerTrigger className={cn(PILL)} disabled={history.length === 0}>
          <History className="size-3.5" />
          History
          {history.length > 0 && <span className="tabular-nums">{history.length}</span>}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              History
            </DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <HistoryRail bare onSelect={() => setOpenRail(null)} />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openRail === "reasoning"}
        onOpenChange={(open) => setOpenRail(open ? "reasoning" : null)}
        showSwipeHandle
      >
        <DrawerTrigger className={cn(PILL)} disabled={!current}>
          <Sigma className="size-3.5" />
          Reasoning
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              How Jev got here
            </DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
            <ReasoningRail bare />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
