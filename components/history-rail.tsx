"use client";

import { useInstinctStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-map";
import { Sparkles, X } from "lucide-react";

export function HistoryRail() {
  const { history, current, status, view, remove } = useInstinctStore();

  if (history.length === 0 && status !== "loading") {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        Past generations show up here, clickable, saved on this device.
      </p>
    );
  }

  return (
    <div className="shadow-float flex max-h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm">
      <div className="scroll-fade-y flex min-h-0 flex-col gap-0.5 overflow-y-auto p-1.5">
        {status === "loading" && (
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
            <div className="shimmer size-4 shrink-0 rounded-md" />
            <div className="shimmer h-3 w-2/3 rounded-md" />
          </div>
        )}
        {history.map((entry) => {
          const Icon = ICON_MAP[entry.decision.style.icon] ?? Sparkles;
          const isActive = current?.id === entry.id;
          return (
            <div
              key={entry.id}
              className={cn(
                "group flex items-center gap-1 rounded-xl pr-1.5 transition-colors hover:bg-accent",
                isActive && "bg-accent"
              )}
            >
              <button
                onClick={() => view(entry.id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-2.5 text-left text-sm"
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                <span className="truncate">{entry.decision.label}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(entry.id);
                }}
                aria-label="Delete"
                className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
